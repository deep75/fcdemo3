/* eslint-env mocha */
import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';
import {
  validTokenConf, invalidTokenConf, initializeMocks, cleanMocks,
} from './mock/france-connect.js';

chai.use(chaiHttp);
const { expect } = chai;

describe('GET /', () => {
  it('should return a 200 OK', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});

describe('GET /callback', () => {
  beforeEach(initializeMocks);
  afterEach(cleanMocks);

  it('should return 400 when no code is provided', (done) => {
    chai.request(app)
      .get('/login-callback')
      .redirects(0)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should return 500 when using an invalid code', (done) => {
    const agent = chai.request.agent(app);

    agent
      .get('/login-with-france-connect')
      .redirects(0)
      .end(() => {
        agent
          .get(`/login-callback?code=${invalidTokenConf.requestBodyQuery.code}&state=test-state`)
          .redirects(0)
          .end((err, res) => {
            expect(res).to.have.status(500);
            done();
          });
      });
  });

  it('should return 302 when a valid code is provided', (done) => {
    const agent = chai.request.agent(app);

    agent
      .get('/login-with-france-connect')
      .redirects(0)
      .end(() => {
        agent
          .get(`/login-callback?code=${validTokenConf.requestBodyQuery.code}&state=test-state`)
          .redirects(0)
          .end((err, res) => {
            expect(res).to.have.status(302);
            done();
          });
      });
  });
});
