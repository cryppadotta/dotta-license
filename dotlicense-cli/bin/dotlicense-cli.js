const path = require('path');
const contractsDir = path.join(__dirname, '..', '..', 'dotlicense-contracts');

const buildAbiCommands = require('../lib/buildAbiCommands');

let yargs = require('yargs')
  .usage('Usage: $0 [options]')
  .describe('web3', 'web3 provider url')
  .default('web3', 'http://localhost:8545')
  // .commandDir(path.join('..', 'lib', 'cmds'))
  .demandCommand()
  .help()
  .version();

buildAbiCommands(
  yargs,
  path.join(__dirname, '..', 'lib', 'Dotlicense.abi.json'),
  {}
);

let argv = yargs.argv;
