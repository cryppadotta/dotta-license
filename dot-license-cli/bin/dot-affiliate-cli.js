const path = require('path');
const yargs = require('yargs');
const dotAbiCli = require('dot-abi-cli');
const HDWalletProvider = require('truffle-hdwallet-provider');

require('../lib/config');

let dotAbiCliConfig = {
  contracts: ['AffiliateProgram'],
  methods: {
    'balances(address)': { userdoc: { notice: 'Look up a balance' } },
    'baselineRate()': { userdoc: { notice: 'The baseline rate' } },
    'lastDepositTime()': {
      userdoc: { notice: 'The global last deposit time' }
    },
    'lastDepositTimes(address)': {
      userdoc: { notice: "A user's last deposit time" }
    },
    'maximumRate()': { userdoc: { notice: 'The maximum rate' } },
    'owner()': { userdoc: { notice: 'The owner' } },
    'pause()': { userdoc: { notice: 'Pause the contract' } },
    'paused()': { userdoc: { notice: 'Is the contract paused?' } },
    'retired()': { userdoc: { notice: 'Is the contract retired?' } },
    'storeAddress()': { userdoc: { notice: 'The store address' } },
    'transferOwnership(address)': { userdoc: { notice: 'Transfer ownership' } },
    'whitelistRates(address)': {
      userdoc: { notice: 'The whitelist rate for address' }
    }
  }
};

let builder = dotAbiCli(
  yargs,
  path.join(__dirname, '..', 'lib', 'Dotlicense.abi.json'),
  dotAbiCliConfig
);

builder = builder
  .usage('Usage: $0 <command> [options]')
  .default('contract-address', process.env.AFFILIATE_PROGRAM_ADDRESS)
  .demand('contract-address')
  .wrap(yargs.terminalWidth());

if (process.env.NODE_ENV == 'ropsten') {
  builder
    .option('provider', {
      hidden: true
    })
    .default(
      'provider',
      new HDWalletProvider(
        process.env.KEY_MNEMONIC,
        process.env.WALLET_PROVIDER_URL,
        process.env.HD_KEY_IDX ? parseInt(process.env.HD_KEY_IDX) : 0
      ),
      '(provider)'
    );
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

builder.argv;
