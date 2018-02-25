const EventEmitter = require('events').EventEmitter;
const FilterSubprovider = require('web3-provider-engine/subproviders/filters');
const inherits = require('util').inherits;
const utils = require('ethereumjs-util');

/**
 * FauxSubscriptionSubprovider -- no-op subscriptions.
 * This is a total hack because of this line:
 * https://github.com/ethereum/web3.js/blob/1.0/packages/web3-core-method/src/index.js#L390
 *
 * which detects any provider that implements .on as supporting subscriptions.
 * web3-provider-engine classes all inherit from EventEmitter and so, while they do
 * have an `on` function, they may not support subscriptions.
 *
 * This class is just a hack to get around the incorrect duck typing detection of web3-core-method
 */
function FauxSubscriptionSubprovider(opts) {
  const self = this;

  opts = opts || {};

  EventEmitter.apply(this, Array.prototype.slice.call(arguments));
  FilterSubprovider.apply(this, [opts]);

  this.subscriptions = {};
}

inherits(FauxSubscriptionSubprovider, FilterSubprovider);

// a cheap crack at multiple inheritance
// I don't really care if `instanceof EventEmitter` passes...
Object.assign(FauxSubscriptionSubprovider.prototype, EventEmitter.prototype);

// preserve our constructor, though
FauxSubscriptionSubprovider.prototype.constructor = FauxSubscriptionSubprovider;

FauxSubscriptionSubprovider.prototype.eth_subscribe = function(payload, cb) {
  cb(null, 1);
};

FauxSubscriptionSubprovider.prototype.eth_unsubscribe = function(payload, cb) {
  cb(null, null);
};

FauxSubscriptionSubprovider.prototype.handleRequest = function(
  payload,
  next,
  end
) {
  switch (payload.method) {
    case 'eth_subscribe':
      this.eth_subscribe(payload, end);
      break;
    case 'eth_unsubscribe':
      this.eth_unsubscribe(payload, end);
      break;
    default:
      FilterSubprovider.prototype.handleRequest.apply(
        this,
        Array.prototype.slice.call(arguments)
      );
  }
};

module.exports = FauxSubscriptionSubprovider;
