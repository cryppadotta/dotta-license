const path = require('path');
const yargs = require('yargs');
const buildAbiCommands = require('../lib/buildAbiCommands');
const getConfig = require('../lib/config');

let builder = yargs
  .usage('Usage: $0 <command> [options]')
  .describe('web3', 'web3 provider url')
  .default('web3', process.env.WEB3_PROVIDER_URL || 'http://localhost:8545')
  .option('from', { description: 'from address' })
  .option('gasPrice', {
    description: 'gas price in wei to use for this transaction',
    default: process.env.GAS_PRICE
  })
  .option('gasLimit', {
    description: 'maximum gas provided for this transaction',
    default: process.env.GAS_LIMIT
  })
  .option('value', {
    description: 'The value transferred for the transaction in wei'
  })
  .describe('license-core-address', 'address to LicenseCore')
  .alias('license-core-address', 'contract-address')
  .default('license-core-address', process.env.LICENSE_CORE_ADDRESS)
  .demand('license-core-address')
  .option('network-id', {
    description: 'The network ID',
    default: process.env.NETWORK_ID
  })
  .option('ledger', {
    description: 'use a ledger'
  })
  .boolean('ledger')
  .option('hd-path', {
    description: 'hd-path (used for hardware wallets)',
    default: "44'/60'/0'/0"
  })
  // .option('hardware-confirm', {
  //   description: 'when using a hardware wallet, ask for on-device confirmation',
  //   default: true
  // })
  // .boolean('hardware-confirm')
  .demandCommand()
  .help()
  .version()
  .wrap(yargs.terminalWidth());

// TODO -- alot of the options above are generic and
// should be put into the library below
// e.g. this should be dot-abi-cli or something
buildAbiCommands(
  yargs,
  path.join(__dirname, '..', 'lib', 'Dotlicense.abi.json'),
  {
    contracts: ['LicenseCore'],
    methods: {
      'setCEO(address)': {
        skip: true
      },
      'setNewAddress(address)': {
        skip: true
      },
      'ceoAddress()': {
        userdoc: {
          notice: "Get the CEO's Address"
        }
      },
      'cfoAddress()': {
        userdoc: {
          notice: "Get the CFO's Address"
        }
      }
      // unpause
      // paused
      // newContractAddress
      // setNewAddress
      // products
      // cooAddress
      // affiliateProgram
      // allProductIds
      // withdrawalAddress
    }
  },
  (argv, { contract, abi }) => {}
);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

builder.argv;
