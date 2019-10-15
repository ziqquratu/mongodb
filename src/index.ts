import {Collection as MongoCollection} from 'mongodb';
import {MongoDBCollection} from './collection';
import {Container} from '@ziggurat/tiamat';
import {Collection, CollectionProducer} from '@ziggurat/ziggurat';

export function mongodb(collection: MongoCollection): CollectionProducer {
  return (container: Container, name: string): Collection => {
    return new MongoDBCollection(collection, name);
  };
}
