const path = require('path');
const yargs = require('yargs');
const dotAbiCli = require('../../index');
const HDWalletProvider = require('truffle-hdwallet-provider');
const NonceTrackerSubprovider = require('web3-provider-engine/subproviders/nonce-tracker');

// Load environment-specific configs
const suffix = process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : '';
require('dotenv').config({
  path: path.resolve(process.cwd(), `.env${suffix}`)
});

let dotAbiCliConfig = {
  contracts: ['KittyCore']
};

let builder = dotAbiCli(
  yargs,
  path.join(__dirname, 'KittyCore.combined.abi.json'),
  dotAbiCliConfig
);

builder = builder
  .default('contract-address', process.env.CONTRACT_ADDRESS)
  .demand('contract-address')
  .wrap(yargs.terminalWidth());

if (process.env.KEY_MNEMONIC) {
  let provider = new HDWalletProvider(
    process.env.KEY_MNEMONIC,
    process.env.WEB3_PROVIDER_URL,
    process.env.HD_KEY_IDX ? parseInt(process.env.HD_KEY_IDX) : 0
  );
  provider.engine.addProvider(new NonceTrackerSubprovider());
  builder
    .option('provider', {
      hidden: true
    })
    .default('provider', provider, '(provider)');
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

builder.argv;
