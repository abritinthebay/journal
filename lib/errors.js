var util = require('util');

var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this);
  this.message = this.name + '::' + msg || 'Error';
};
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

var RoutingError = function (msg) {
  RoutingError.super_.call(this, msg, this.constructor);
};
util.inherits(RoutingError, AbstractError);
RoutingError.prototype.name = 'Routing Error';

var DatabaseError = function (msg) {
  RoutingError.super_.call(this, msg, this.constructor);
};
util.inherits(DatabaseError, AbstractError);
RoutingError.prototype.name = 'Routing Error';

module.exports = {
  RoutingError: RoutingError,
  DatabaseError: DatabaseError
};
