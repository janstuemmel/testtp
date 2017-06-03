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

Testtp.prototype.close = function(cb) {

  return new Promise((res, rej) => {
    try {
      this._server.close(() => {
        if(typeof cb === 'function') cb();
        res();
      });
    } catch(e) {
      rej(e);
    }
  });
};

module.exports = (server, cb) => {

  // if an express or koa object is passed
  if(!(server instanceof http.Server)) {
    server = http.createServer(server);
  }

  return new Promise((res, rej) => {
    try {
      server.listen(0, '127.0.0.1', () => {
        var testtp = new Testtp(server);
        if(typeof cb === 'function') cb(null, testtp);
        res(testtp);
      });
    } catch(e) {
      cb(e);
      rej(e);
    }
  });
};
