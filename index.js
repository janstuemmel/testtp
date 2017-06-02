const http = require('http');

function Testtp(server) {
  this._server = server;
  this.port = this._server.address().port;
  this.address = this._server.address().address;
  this.url = [[ 'http://', this.address].join(''), this.port ].join(':');
}

Testtp.prototype.close = function() {

  return new Promise((res, rej) => {

    try {

      this._server.close(() => res(true));

    } catch(e) {

      rej(e);
    }
  });
};

module.exports = (server, port) => {

  // if an express or koa object is passed
  if(!(server instanceof http.Server)) {
    server = http.createServer(server);
  }

  return new Promise((res, rej) => {
    try {
      server.listen(0, '127.0.0.1', () => {
        res(new Testtp(server));
      });
    } catch(e) {
      rej(e);
    }
  });
};
