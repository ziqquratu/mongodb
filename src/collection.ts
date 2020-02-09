import {
  Collection,
  Cursor,
  ReplaceOneOptions,
  SortingDirection,
  SortingKey,
  sortingMap,
  applyQueryOptions,
  QueryOptions
} from '@ziqquratu/database';
import {EventEmitter} from 'eventemitter3';
import * as mongo from 'mongodb';

export class MongoDBCursor<T = any> implements Cursor<T> {
  public constructor(
    private cursor: mongo.Cursor,
    options: QueryOptions = {},
  ) {
    applyQueryOptions(this, options);
  }

  public sort(key: SortingKey, direction?: SortingDirection): Cursor<T> {
    this.cursor.sort(sortingMap(key, direction));
    return this;
  }

  public skip(count: number): Cursor<T> {
    this.cursor.skip(count);
    return this;
  }

  public limit(count: number): Cursor<T> {
    this.cursor.limit(count);
    return this;
  }

  public async next(): Promise<T | null> {
    return this.cursor.next();
  }

  public async hasNext(): Promise<boolean> {
    return this.cursor.hasNext();
  }

  public async forEach(iterator: (doc: T) => void): Promise<void> {
    return this.cursor.forEach(iterator);
  }

  public async toArray(): Promise<T[]> {
    return this.cursor.toArray();
  }

  public async count(applySkipLimit = true): Promise<number> {
    return this.cursor.count(applySkipLimit);
  }
}

export class MongoDBCollection extends EventEmitter implements Collection {
  public constructor(
    private collection: mongo.Collection,
    public readonly name: string
  ) {
    super();
  }

  public find(selector: object = {}, options?: QueryOptions): Cursor<any> {
    return new MongoDBCursor(this.collection.find(selector), options);
  }

  public async findOne(selector: object): Promise<any> {
    return this.collection.findOne(selector);
  }

  public async insertOne(doc: any): Promise<any> {
    let res = await this.collection.insertOne(doc);
    if (res.result.ok !== 1) {
      throw Error('Failed to insert document');
    }
    const resultDoc = res.ops ? res.ops[0] : doc;
    this.emit('document-upserted', resultDoc);
    return resultDoc;
  }

  public async insertMany(docs: any[]): Promise<any[]> {
    let res = await this.collection.insertMany(docs);
    if (res.result.ok !== 1) {
      throw Error('Failed to insert documents');
    }
    const resultDocs = res.ops ? res.ops : docs;
    for (const doc of resultDocs) {
      this.emit('document-upserted', doc);
    }
    return resultDocs;
  }

  public async replaceOne(selector: object, doc: any, options?: ReplaceOneOptions): Promise<any> {
    return this.collection.replaceOne(selector, doc, options);
  }

  public async deleteOne(selector: object): Promise<any> {
    const doc = await this.findOne(selector);
    const res = await this.collection.deleteOne(selector);
    if (doc && res.deletedCount === 1) {
      this.emit('document-removed', doc);
    }
    return doc;
  }

  public async deleteMany(selector: object): Promise<any[]> {
    const docs = await this.find(selector).toArray();
    await this.collection.deleteMany(selector);
    for (let doc of docs) {
      this.emit('document-removed', doc);
    }
    return docs;
  }
}
