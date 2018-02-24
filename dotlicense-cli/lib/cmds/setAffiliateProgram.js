const Bluebird = require('bluebird');
const getConfig = require('../config');

const command = {
  command: 'set-affiliate-program [new-affiliate-address]',
  desc: 'Set the affiliate program address',
  builder: function(yargs) {
    return yargs
      .positional('new-affiliate-address', {
        describe: 'the address of the affiliate program to set'
      })
      .demand('new-affiliate-address');
  },
  handler: async function(argv) {
    const { web3, abis } = getConfig(argv);

    const license = new web3.eth.Contract(
      abis.LicenseCore,
      process.env.LICENSE_CORE_ADDRESS
    );

    await license.methods
      .setAffiliateProgramAddress(argv.newAffiliateAddress)
      .send({ from: process.env.SENDER_ADDRESS })
      .once('transactionHash', function(hash) {
        console.log('transactionHash', hash);
      })
      .once('receipt', function(receipt) {
        console.log('receipt once', receipt);
      })
      .once('confirmation', function(confNumber, receipt) {
        console.log('confirmation', confNumber, receipt);
      })
      .on('error', function(error) {
        console.log('error', error);
      });
  }
};

module.exports = command;
