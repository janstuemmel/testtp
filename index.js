const http = require('http');
const fetch = require('node-fetch');
const { map, forEach, assign } = require('lodash');

const methods = map(http.METHODS, m => m.toLowerCase());

class Testtp {

  constructor(server) {
    this._server = server;
    this.port = this._server.address().port;
    this.address = this._server.address().address;
    this.protocol = 'http://';
    this.url = [[ this.protocol, this.address].join(''), this.port ].join(':');

    forEach(methods, m => {
      this[m] = (path, opt) => {
        opt = assign({}, opt, { method: m });
        path = [ this.url, path ].join('');
        return fetch(path, opt);
      };
    });
  }
}

function tryClose(server, res, rej) {
  try {
    server.close(res);
  } catch(e) {
    rej ? rej(e) : res(e);
  }
}


Testtp.prototype.close = function(cb) {


  if(typeof cb === 'function') {
    tryClose(this._server, cb);
    return;
  }

  return new Promise((res, rej) => {
    tryClose(this._server, res, rej);
  });

};


function tryListen(server, res, rej) {

  try {
    server.listen(0, '127.0.0.1', () =>
      rej ? res(new Testtp(server)) : res(null, new Testtp(server)));
  } catch(e) {
    rej ? rej(e) : res(e);
  }
}


module.exports = (server, cb) => {

  // if an express or koa object is passed
  if(!(server instanceof http.Server)) {
    server = http.createServer(server);
  }

  if(typeof cb === 'function') {
    tryListen(server, cb);
    return;
  }

  return new Promise((res, rej) => {
    tryListen(server, res, rej);
  });
};
