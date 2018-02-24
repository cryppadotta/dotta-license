const buildSetAddressCommand = require('../buildSetAddressCommand');

// console.log("You really don't want to do this.");
// process.exit(1);

const command = buildSetAddressCommand({
  desc: 'Set the CEO address',
  method: 'setCEO-nope-nope-nope',
  argument: 'ceo-address'
});

module.exports = command;
