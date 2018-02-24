const path = require('path');

const contractsDir = path.join(__dirname, '..', '..', 'dotlicense-contracts');

let argv = require('yargs')
  .usage('Usage: $0 [options]')
  .describe('web3', 'web3 provider url')
  .default('web3', 'http://localhost:8545')
  .describe('LicenseCoreAddress', 'LicenseCore address')
  .describe('AffiliateProgramAddress', 'AffiliateProgram address')
  .commandDir(path.join('..', 'lib', 'cmds'))
  .demandCommand()
  .help()
  .version().argv;
