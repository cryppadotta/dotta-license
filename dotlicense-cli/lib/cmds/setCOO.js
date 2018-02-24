const buildSetAddressCommand = require('../buildSetAddressCommand');

const command = buildSetAddressCommand({
  desc: 'Set the COO address',
  method: 'setCOO',
  argument: 'coo-address'
});

module.exports = command;
