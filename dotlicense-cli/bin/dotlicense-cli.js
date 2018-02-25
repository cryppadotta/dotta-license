const path = require('path');
const yargs = require('yargs');
const buildAbiCommands = require('../lib/buildAbiCommands');
const getConfig = require('../lib/config');

let builder = yargs
  .usage('Usage: $0 <command> [options]')
  .describe('web3', 'web3 provider url')
  .default('web3', process.env.WEB3_PROVIDER_URL || 'http://localhost:8545')
  .describe('license-core-address', 'address to LicenseCore')
  .alias('license-core-address', 'contract-address')
  .default('license-core-address', process.env.LICENSE_CORE_ADDRESS)
  .demand('license-core-address')
  .option('ledger', {
    description: 'use a ledger'
  })
  .boolean('ledger')
  .demandCommand()
  .help()
  .version()
  .wrap(yargs.terminalWidth());

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

builder.argv;
