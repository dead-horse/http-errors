
var assert = require('assert');
var statuses = require('statuses');
var inherits = require('util').inherits;

exports = module.exports = function (status, msg, props) {
  if ('object' == typeof status && !(status instanceof Error)) {
    props = status;
    status = null;
  }

  // create(msg, status)
  // this should be removed, but remains for koa backwards compat
  if ('number' == typeof msg) {
    var tmp = msg;
    msg = status || statuses[tmp];
    status = tmp;
  }

  // create(msg);
  if ('string' == typeof status) {
    msg = status;
    status = 500;
  }

  props = props || {};
  var err = msg instanceof Error
    ? msg
    : new Error(msg || statuses[status || 500]);
  for (var key in props) err[key] = props[key];
  err.status = err.statusCode = status || err.status || 500;
  assert(statuses(err.status), 'invalid status code');
  err.expose = 'number' === typeof err.status
    && statuses[err.status]
    && err.status < 500;
  return err;
};

// create generic error objects
var codes = statuses.codes.filter(function (num) {
  return num >= 400;
});

codes.forEach(function (code) {
  if (code >= 500) {
    var ServerError = function ServerError(msg) {
      Error.call(this);
      this.message = msg || statuses[code];
      Error.captureStackTrace(this, arguments.callee);
    }
    inherits(ServerError, Error);
    ServerError.prototype.status =
    ServerError.prototype.statusCode = code;
    ServerError.prototype.expose = false;
    exports[code] =
    exports[statuses[code].replace(/\s+/g, '')] = ServerError;
    return;
  }

  var ClientError = function ClientError(msg) {
    Error.call(this);
    this.message = msg || statuses[code];
    Error.captureStackTrace(this, arguments.callee);
  }
  inherits(ClientError, Error);
  ClientError.prototype.status =
  ClientError.prototype.statusCode = code;
  ClientError.prototype.expose = false;
  exports[code] =
  exports[statuses[code].replace(/\s+/g, '')] = ClientError;
  return;
});
