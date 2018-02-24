const Bluebird = require('bluebird');
const getConfig = require('./config');

const buildSetAddressCommand = opts => {
  return {
    command: `set-${opts.argument} [${opts.argument}]`,
    desc: opts.desc,
    builder: function(yargs) {
      return yargs
        .positional(opts.argument, {
          describe: 'the address of the to set'
        })
        .demand(opts.argument);
    },
    handler: async function(argv) {
      const { web3, abis } = getConfig(argv);

      const license = new web3.eth.Contract(
        abis.LicenseCore,
        process.env.LICENSE_CORE_ADDRESS
      );

      await license.methods[opts.method](argv[opts.argument])
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
};

module.exports = buildSetAddressCommand;
