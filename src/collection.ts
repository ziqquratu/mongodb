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

  public async upsert(obj: any): Promise<any> {
    let res: any;
    try {
      res = await this.collection.insertOne(obj);
    } catch (err) {
      res = await this.collection.updateOne({_id: obj._id}, {$set: obj});
    }
    if (res.result.ok !== 1) {
      throw Error('Failed to upsert document');
    }
    return res.ops ? res.ops[0] : obj;
  }

  public async remove(selector: object): Promise<any[]> {
    const docs = this.find(selector);
    await this.collection.deleteMany(selector);
    return docs;
  }

  public async count(selector?: object): Promise<number> {
    return this.collection.countDocuments(selector);
  }
}
