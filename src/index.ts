import {Collection, QueryOptions} from '@ziggurat/ziggurat';
import {EventEmitter} from 'eventemitter3';
import {ObjectID, Collection as MongoCollection} from 'mongodb';

export class MongoDBCollection extends EventEmitter implements Collection {
  public constructor(private collection: MongoCollection) {
    super();
  }

  public get name(): string {
    return this.collection.collectionName;
  }

  public async find(selector: object = {}, options: QueryOptions = {}): Promise<any[]> {
    return [];
  }

  public async findOne(selector: object): Promise<any> {
    return null;
  }

  public async upsert(obj: any): Promise<any> {
    return null;
  }

  public async remove(selector: object): Promise<any[]> {
    return [];
  }

  public async count(selector?: object): Promise<number> {
    return 0;
  }
}
