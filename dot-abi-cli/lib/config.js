const debug = require('debug')('dotcli');
const fs = require('fs');
const Bluebird = require('bluebird');
const _ = require('lodash');
const chalk = require('chalk');
const Web3 = require('web3');
const web3 = new Web3();
web3.eth = Bluebird.promisifyAll(web3.eth);
const FauxSubscriptionSubprovider = require('./FauxSubscriptionSubprovider');
const path = require('path');
const stringify = require('fast-safe-stringify');

// TODO - move the ledger provider to its own file
// and allow someone to configure their own provider
const configureLedger = async argv => {
  const ProviderEngine = require('web3-provider-engine');
  const LedgerWalletSubproviderFactory = require('ledger-wallet-provider')
    .default;
  const Web3SubProvider = require('web3-provider-engine/subproviders/web3');
  const NonceTrackerSubprovider = require('web3-provider-engine/subproviders/nonce-tracker');

  const engine = new ProviderEngine();
  web3.setProvider(engine);
  engine.addProvider(new NonceTrackerSubprovider());

  const ledgerWalletSubProvider = await LedgerWalletSubproviderFactory(
    () => argv.networkId,
    argv.hdPath,
    argv.hardwareConfirm
  );
  const httpProvider = new web3.providers.HttpProvider(argv.web3);

  // ledgerWalletSubProvider.setEngine = () => true;
  engine.addProvider(ledgerWalletSubProvider);

  const httpSubprovider = new Web3SubProvider(httpProvider);

  // shim until web3-provider-engine supports the new API
  httpSubprovider.handleRequest = function(payload, next, end) {
    this.provider.send(payload, function(err, response) {
      if (err != null) return end(err);
      if (response.error != null) return end(new Error(response.error.message));
      end(null, response.result);
    });
  };

  // faux subscriptions. See FauxSubscriptionSubprovider for details
  const fauxSubSub = new FauxSubscriptionSubprovider();
  engine.addProvider(fauxSubSub);

  engine.addProvider(httpSubprovider);
  engine.start();
  // _engine = engine;

  let accounts = await web3.eth.getAccountsAsync();
  debug('accounts are:', stringify(accounts));
  return engine;
};

async function configureProvider(argv, opts = {}) {
  if (argv.provider) {
    let provider = await argv.provider;
    web3.setProvider(provider);
  } else if (argv.ledger) {
    await configureLedger(argv);
  } else {
    web3.setProvider(new web3.providers.HttpProvider(argv.web3));
  }
  return web3;
}

let __web3;

async function configure(argv, opts = {}) {
  // if (__web3) {
  //   return { web3: __web3 };
  // } else {
  debug(stringify(argv, null, 2));
  const web3 = await configureProvider(argv, opts);
  __web3 = web3;
  return { web3 };
  //}
}

module.exports = configure;
