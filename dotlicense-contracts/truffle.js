var ganache = require('ganache-cli');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    test: {
      provider: ganache.provider(),
      network_id: '*'
    },
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*' // Match any network id
    },
    geth: {
      host: 'localhost',
      port: 8545,
      from: 'ff369c07c8e365aa8fabe5e40a320d35cc350ba2',
      network_id: '*', // Match any network id
      gas: 4700000, // Gas limit used for deploys
      gasPrice: 10000000000 // 10 gwei
    },
    kovan: {
      host: 'localhost',
      port: 8546,
      network_id: '42',
      gas: 4612388
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '': ['ast'],
        '*': [
          'abi',
          'evm.bytecode.object',
          'evm.bytecode.sourceMap',
          'evm.deployedBytecode.object',
          'evm.deployedBytecode.sourceMap',
          'devdoc',
          'userdoc',
          'metadata',
          'evm.methodIdentifiers',
          'evm.gasEstimates'
        ]
      }
    }
  },
  test_directory: 'transpiled/test',
  migrations_directory: 'transpiled/migrations'
};
