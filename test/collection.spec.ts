import {Collection as MongoCollection} from 'mongodb';
import {Collection} from '@ziggurat/ziggurat';
import {MongoDBCollection} from '../src/collection';
import {expect} from 'chai';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import 'mocha';

let mongodb = require('mongo-mock');
let MongoClient = mongodb.MongoClient;
MongoClient.persist = 'mongo.js';

chai.use(chaiAsPromised);

describe('MongoDBCollection', () => {
  let mongoCollection: MongoCollection;
  let col: Collection;

  before(async () => {
    const client = await MongoClient.connect('mongodb://localhost:27017/test', {});

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
      return expect(col.findOne({_id: '5da59296d6f3f71c28ae0aff'})).to.eventually.be.rejectedWith('');
    });
    it('should return the document when found', async () => {
      let doc = await col.findOne({foo: 'bar'});
      expect(doc).to.haveOwnProperty('foo').equals('bar');
    });
  });

  describe('find', () => {
    it('should return empty list when no documents match selector', () => {
      return expect(col.find({_id: '5da59296d6f3f71c28ae0aff'})).to.eventually.be.empty;
    });
    it('should return a list of matched documents', async () => {
      const docs = await col.find({foo: 'bar'});
      expect(docs).to.have.length(1);
      expect(docs[0]).to.haveOwnProperty('foo').equal('bar');
    });
  });
});
