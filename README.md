# Testtp

[![Build Status](https://travis-ci.org/janstuemmel/testtp.svg?branch=master)](https://travis-ci.org/janstuemmel/testtp)

A library for testing node http.Server.
Works with express.

## Install

```sh
npm i janstuemmel/testtp
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
});

```

## API

`Class: Testtp`
  * `_server` Stores the node http.Server instance
  * `port` Stores the port
  * `address` Stores the address, `127.0.0.1`
  * `url` Stores the full url, `http://127.0.0.1:1337`
  * `close()` Closes the connection (Promise)

## License

MIT
