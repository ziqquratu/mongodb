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

  after(async () => {
    await mongoCollection.drop();
  });

  describe('upsert', () => {
    it('should add a single document', async () => {
      let doc = await col.upsert({data: 'value'});
      expect(doc.data).to.eql('value');
      expect(doc).to.haveOwnProperty('_id');
    });
    it('should update a single document', async () => {
      let doc1: any = await col.upsert({data: 'value'});
      let doc2 = await col.upsert({_id: doc1._id, data: 'new value'});
      expect(doc1._id).to.eql(doc2._id);
      expect(doc1.data).to.eql('value');
      expect(doc2.data).to.eql('new value');
    });
  });

  describe('count', () => {
    it('should return 0 when no documents are matching', () => {
      expect(col.count({foo: 'no matches'})).to.eventually.eql(0);
    });
    it('should be 1 when a document is added', async () => {
      await col.upsert({foo: 'bar'});
      expect(col.count({foo: 'bar'})).to.eventually.eql(1);
    });
  });

  describe('findOne', () => {
    it('should throw when document is not found', () => {
      expect(col.findOne({_id: '5da59296d6f3f71c28ae0aff'})).to.eventually.throw();
    });
  });
});