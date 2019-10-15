import {MongoClient, Collection as MongoCollection} from 'mongodb';
import {Collection} from '@ziggurat/ziggurat';
import {MongoDBCollection} from '../src/collection';
import {expect} from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import 'mocha';

chai.use(chaiAsPromised);

describe('MongoDBCollection', () => {
  let mongoCollection: MongoCollection;
  let col: Collection;

  before(async () => {
    const client = new MongoClient('mongodb://localhost:27017', {useUnifiedTopology: true});
    await client.connect();

    mongoCollection = client.db('test').collection('test');

    col = new MongoDBCollection(mongoCollection, 'test');
  });

  after(() => {
    mongoCollection.drop();
  });

  describe('findOne', () => {
    it('should throw when document is not found', () => {
      expect(col.findOne({_id: '5da59296d6f3f71c28ae0aff'})).to.eventually.throw();
    });
  });
});
