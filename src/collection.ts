import {Collection, QueryOptions} from '@ziggurat/ziggurat';
import {EventEmitter} from 'eventemitter3';
import {ObjectID, Collection as MongoCollection} from 'mongodb';

export class MongoDBCollection extends EventEmitter implements Collection {
  public constructor(
    private collection: MongoCollection,
    public readonly name: string
  ) {
    super();
  }

  public async find(selector: object = {}, options: QueryOptions = {}): Promise<any[]> {
    return [];
  }

  public async findOne(selector: object): Promise<any> {
    const doc = await this.collection.findOne(this.toObjectID(selector));
    if (!doc) {
      throw new Error('Failed to find document in collection');
    }
    return doc;
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

  private toObjectID(selector: any): any {
    if (!selector._id) {
      return selector;
    }
    const out = JSON.parse(JSON.stringify(selector));
    const id = out._id;

    if (typeof id === 'string' || typeof id === 'number') {
      out._id = new ObjectID(id);
    }
    return out;
  }
}
