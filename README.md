# Testtp

[![Build Status](https://travis-ci.org/janstuemmel/testtp.svg?branch=master)](https://travis-ci.org/janstuemmel/testtp)
[![Test Coverage](https://codeclimate.com/github/janstuemmel/testtp/badges/coverage.svg)](https://codeclimate.com/github/janstuemmel/testtp/coverage)
[![npm version](https://badge.fury.io/js/testtp.svg)](https://badge.fury.io/js/testtp)

A library that simplifies testing with node http.Server's or listeners like express.
It exposes `node-fetch` ([bitinn/node-fetch](https://github.com/bitinn/node-fetch)) to get data from the test server.

## Install

```sh
npm install --save-dev testtp
```

## Usage

A sample `jest` test.

```js
var http = require('http')
var express = require('express')
var fetch = require('node-fetch')
var createTestServer = require('testtp');

describe('tests', () => {

  it('test', async () => {

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

```

## API

`testtp(server [, cb])` returns a Promise instance to create `Testtp` instance
  * arg `server` a http.Server (or express etc.) instance
  * arg `cb` optional callback with `Testtp` instance

`Class: Testtp`
  * `_server` Stores the node http.Server instance
  * `port` Stores the port
  * `address` Stores the address, `127.0.0.1`
  * `url` Stores the full url, `http://127.0.0.1:1337`
  * `close([cb])` Closes the connection (Callback or Promise)
  * `[HTTP_METHOD](path)` Requests the test server (`node-fetch`)

## License

MIT
