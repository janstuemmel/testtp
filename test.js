const express = require('express');
const http = require('http');
const fetch = require('node-fetch');
const { forEach, map } = require('lodash');
const portUsed = require('tcp-port-used');

const createTestServer = require('./');

describe('testtp', () => {

  describe('readme', () => {

    it('example', async () => {

      // given
      var app = express().get('/', (req, res) => res.send('OK'));

      // returns a Testtp instance
      var test = await createTestServer(app);

      expect(test._server).toEqual(expect.any(http.Server));
      expect(test.port).toEqual(expect.any(Number));
      expect(test.address).toBe('127.0.0.1');
      expect(test.url).toBe(['http://127.0.0.1', test.port].join(':'));

      // when
      var res = await test.get('/');
      var text = await res.text();

      // then
      expect(res.status).toBe(200);
      expect(text).toBe('OK');

      // after
      await test.close();
    });
  });


  describe('server tests', () => {

    it('should listen', async () => {

      // when
      var test = await createTestServer(http.createServer());

      // then
      await expect(portUsed.check(test.port, '127.0.0.1')).resolves.toBe(true);

      // after
      await test.close();
    });


    it('should listen by callback', (done) => {

      // when
      createTestServer(http.createServer(), async (err, test) => {

        // then
        expect(test._server).toEqual(expect.any(http.Server));
        expect(err).toBe(null);
        await expect(portUsed.check(test.port, '127.0.0.1')).resolves.toBe(true);

        // after
        test.close(done);
      });
    });


    it('should close', async (done) => {

      // given
      var test = await createTestServer(http.createServer());

      // when
      test.close().then(() => {

        // then
        portUsed.check(test.port, '127.0.0.1').then(used => {
          expect(used).toBe(false);
          done();
        });
      });
    });


    it('should close by callback', async (done) => {

      // given
      var test = await createTestServer(http.createServer());

      // when
      test.close(() => {

        // then
        portUsed.check(test.port, '127.0.0.1').then(used => {
          expect(used).toBe(false);
          done();
        });
      });
    });


    it('should close by async/await', async () => {

      // given
      var test = await createTestServer(http.createServer());

      // when
      await test.close();

      // then
      expect(portUsed.check(test.port, '127.0.0.1')).resolves.toBe(false);
    });


    it('should create with express server', async () => {

      // given
      const app = express();

      // when
      var test = await createTestServer(app);

      // then
      expect(test).toMatchObject({
        port: expect.any(Number),
        _server: expect.any(http.Server)
      });

      // after
      await test.close();

    });


    it('should create with http.Server', async () => {

      // given
      const app = http.createServer();

      // when
      var test = await createTestServer(app);

      // then
      expect(test).toMatchObject({
        port: expect.any(Number),
        _server: expect.any(http.Server)
      });

      // after
      await test.close();
    });
  });


  describe('request tests', () => {

    const app = express().use((req, res) => res.send('OK'));
    let test;

    beforeEach( async () => { test = await createTestServer(app) });

    afterEach((done) => test.close(done));


    it('should get', (done) => {

      // when
      test.get('/').then(res => res.text()).then(text => {

        // then
        expect(text).toBe('OK');
        done();
      });
    });


    it('should get async/await', async () => {

      // when
      var res = await test.get('/').then(res => res.text());

      // then
      expect(res).toBe('OK');
    });


    it('method connect not allowed', () => {

      // then
      expect(test.connect('/')).rejects.toEqual(expect.any(Error));
    });


    it('method head returns empty body', async () => {

      // when
      var body = await test.head('/').then(res => res.text());

      // then
      expect(body).toBe('');
    });


    it('should support all methods from http.METHODS', async () => {

      // given
      var promises = map(http.METHODS, (m, i) => {
        return new Promise((res, rej) => {
          var resolve = (r) => res([m, r]);
          test[m.toLowerCase()]('/').then(r => r.text())
            .then(resolve)
            .catch(resolve);
        });
      });

      // when
      var results = await Promise.all(promises);

      // then
      expect(results).toEqual(map(http.METHODS, m => {
        // expect error with CONNECT method, see tests above
        return [ m, m==='CONNECT' ? expect.any(Error) : expect.any(String) ]
      }));
    });

  });

});
