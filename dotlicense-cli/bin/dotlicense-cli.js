const path = require('path');
const yargs = require('yargs');
const dotAbiCli = require('dot-abi-cli');
require('../lib/config');

let builder = dotAbiCli(
  yargs,
  path.join(__dirname, '..', 'lib', 'Dotlicense.abi.json'),
  {
    contracts: ['LicenseCore'],
    methods: {
      'setCEO(address)': {
        // skip: true
        dangerous: true
      },
      'setNewAddress(address)': {
        // skip: true
        dangerous: true
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
      },
      'unpause()': { userdoc: { notice: 'Unpause the contract' } },
      'paused()': { userdoc: { notice: 'Checks if the contract is paused' } },
      'newContractAddress()': {
        userdoc: { notice: 'Gets the new contract address' }
      },
      'setNewAddress(address)': {
        userdoc: { notice: 'Sets a new contract address' },
        dangerous: true
      },
      'products()': { userdoc: { notice: 'Gets the products' } },
      'cooAddress()': { userdoc: { notice: 'Get the COOs address' } },
      'affiliateProgram()': {
        userdoc: { notice: 'Get the affiliate program address' }
      },
      'allProductIds()': { userdoc: { notice: 'Get all product ids' } },
      'withdrawalAddress()': {
        userdoc: { notice: 'Get the withdrawal address' }
      }
    }
  },
  (argv, { contract, abi }) => {}
);

builder = builder
  .usage('Usage: $0 <command> [options]')
  .default('contract-address', process.env.LICENSE_CORE_ADDRESS)
  .demand('contract-address')
  .commandDir(path.join(__dirname, '..', 'lib', 'cmds'))
  .wrap(yargs.terminalWidth());

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

builder.argv;
