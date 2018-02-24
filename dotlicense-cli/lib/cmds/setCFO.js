const buildSetAddressCommand = require('../buildSetAddressCommand');

const command = buildSetAddressCommand({
  desc: 'Set the CFO address',
  method: 'setCFO',
  argument: 'cfo-address'
});

module.exports = command;
