const path = require('path');
const contractsDir = path.join(__dirname, '..', '..', 'dotlicense-contracts');

const buildAbiCommands = require('../lib/buildAbiCommands');
const yargs = require('yargs');

let builder = yargs
  .usage('Usage: $0 <command> [options]')
  .describe('web3', 'web3 provider url')
  .default('web3', 'http://localhost:8545')
  // .commandDir(path.join('..', 'lib', 'cmds'))
  .demandCommand()
  .help()
  .version()
  .wrap(yargs.terminalWidth());

buildAbiCommands(
  yargs,
  path.join(__dirname, '..', 'lib', 'Dotlicense.abi.json'),
  {
    contracts: ['LicenseCore'],
    skipFunction: ['setCEO']
  },
  (argv, { contract, abi }) => {}
);

builder.argv;
