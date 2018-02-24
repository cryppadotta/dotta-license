const buildSetAddressCommand = require('../buildSetAddressCommand');

const command = buildSetAddressCommand({
  desc: 'Set the withdrawal address',
  method: 'setWithdrawalAddress',
  argument: 'withdrawal-address'
});

module.exports = command;
