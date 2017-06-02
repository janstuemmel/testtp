const express = require('express');
const http = require('http');
const fetch = require('node-fetch');

const createTestServer = require('./');

describe('tests', () => {

  it('example from readme', async () => {

    // given
    var app = express().get('/', (req, res) => res.send('OK'));

    // returns the Testtp instance
    var test = await createTestServer(app);

    expect(test._server).toEqual(expect.any(http.Server));
    expect(test.port).toEqual(expect.any(Number));
    expect(test.address).toBe('127.0.0.1');
    expect(test.url).toBe(['http://127.0.0.1', test.port].join(':'));

    // when
    var res = await fetch(test.url);
    var text = await res.text();

    // then
    expect(res.status).toBe(200);
    expect(text).toBe('OK');

    // after
    await test.close();
  });

  it('should create express server', async () => {

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


  it('should create http.Server', async () => {

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


  it('should get / from express server', async () => {

    // given
    var app = express().get('/', (req, res) => res.send('OK'));
    var test = await createTestServer(app);

    // when
    var res = await fetch(test.url);
    var text = await res.text();

    // then
    expect(res.status).toBe(200);
    expect(text).toBe('OK');

    // after
    await test.close();
  });


  it('should with with Promise', (done) => {

    // given
    var spy = jest.fn((test) => {

      // then
      expect(test._server).toEqual(expect.any(http.Server));

      // after
      test.close().then(done)
    });

    // when
    createTestServer(http.createServer()).then(spy);
  });

});
