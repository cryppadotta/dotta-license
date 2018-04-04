var path = require('path');
var ganache = require('ganache-cli');
var HDWalletProvider = require('truffle-hdwallet-provider');

// Load environment-specific configs
const suffix = process.env.NODE_ENV ? '.' + process.env.NODE_ENV : '';
const envConfigFile = path.resolve(process.cwd(), `.env${suffix}`);
console.log('envConfigFile', envConfigFile);
require('dotenv').config({
  path: envConfigFile
});

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
    },
    ropsten: {
      provider: new HDWalletProvider(
        process.env.KEY_MNEMONIC,
        process.env.WALLET_PROVIDER_URL
      ),
      network_id: 3,
      gas: 4700000, // Gas limit used for deploys
      gasPrice: 30000000000 // 30 gwei
    },
    rinkeby: {
      provider: new HDWalletProvider(
        process.env.KEY_MNEMONIC,
        process.env.WALLET_PROVIDER_URL
      ),
      network_id: 4,
      gas: 4700000, // Gas limit used for deploys
      gasPrice: 20000000000 // 20 gwei
    },
    mainnet: {
      provider: new HDWalletProvider(
        process.env.KEY_MNEMONIC,
        process.env.WALLET_PROVIDER_URL
      ),
      network_id: 1,
      gas: 4700000, // Gas limit used for deploys
      gasPrice: 1000000000 // 1 gwei
    },
    remix: {
      provider: new HDWalletProvider(
        process.env.KEY_MNEMONIC,
        process.env.WALLET_PROVIDER_URL
      ),
      network_id: 1,
      gas: 4700000, // Gas limit used for deploys
      gasPrice: 1000000000 // 1 gwei
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  test_directory: 'transpiled/test',
  migrations_directory: 'transpiled/migrations'
};
