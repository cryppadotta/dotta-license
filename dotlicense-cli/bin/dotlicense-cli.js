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
