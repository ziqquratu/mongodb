import {Collection, QueryOptions} from '@ziggurat/ziggurat';
import {EventEmitter} from 'eventemitter3';
import {Collection as MongoCollection} from 'mongodb';

export class MongoDBCollection extends EventEmitter implements Collection {
  public constructor(
    private collection: MongoCollection,
    public readonly name: string
  ) {
    super();
  }

  public async find(selector: object = {}, options: QueryOptions = {}): Promise<any[]> {
    let cursor = this.collection.find(selector);
    if (options.sort) {
      cursor = cursor.sort(options.sort);
    }
    if (options.offset) {
      cursor = cursor.skip(options.offset);
    }
    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }
    return cursor.toArray();
  }

  public async findOne(selector: object): Promise<any> {
    const doc = await this.collection.findOne(selector);
    if (!doc) {
      throw new Error('Failed to find document in collection');
    }
    return doc;
  }

  public async upsert(doc: any): Promise<any> {
    let res: any;
    try {
      res = await this.collection.insertOne(doc);
    } catch (err) {
      res = await this.collection.updateOne({_id: doc._id}, {$set: doc});
    }
    if (res.result.ok !== 1) {
      throw Error('Failed to upsert document');
    }
    const resultDoc = res.ops ? res.ops[0] : doc;
    this.emit('document-upserted', resultDoc);
    return resultDoc;
  }

  public async remove(selector: object): Promise<any[]> {
    const docs = await this.find(selector);
    await this.collection.deleteMany(selector);
    for (let doc of docs) {
      this.emit('document-removed', doc);
    }
    return docs;
  }

  public async count(selector?: object): Promise<number> {
    return this.collection.countDocuments(selector);
  }
}
