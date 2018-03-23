# dot-license-contracts

Part of [Dotlicense](../README.md). See that file for an overview of the project as well as the contract architecture.

## Configuration

Create a `.env` file for each environment you intend to use. E.g create a file `.env.rinkeby` with the following key/value pairs:

    # .env.rinkeby
    KEY_MNEMONIC="cat dog frog tiger etc"
    WALLET_PROVIDER_URL=https://rinkeby.infura.io/myapikeyhere

Use the `NODE_ENV` variable to designate a specific config file. E.g.:

    NODE_ENV=rinkeby truffle migrate --network rinkeby

More configuration (such as gas limits and prices) can be found in [`truffle.js`](truffle.js)

## Deploying the Contracts

In the [Makefile](Makefile) there are commands such as:

    make migrate-ropsten
    make migrate-rinkeby

Note: you can use the `--reset` option to start your migrations from the beginning.

## Building ABI

If you need to rebuild the ABI, you can do it with the following command:

    # requires docker
    make build-abi

This will generate a _combined_ ABI that includes the abi, devdoc, and userdoc.

## Gas Estimates

You can [view the current gas estimates here](doc/gas-estimates.txt).

You can generate the gas estimates with the following command:

    make gas-estimates

## Submitting Source to Etherscan

To submit your code to Etherscsan:

* `make flatten_source`
* `cat LicenseCore.etherscan.sol | pbcopy`
* Visit the source verification page that supports the optimizer runs (Their "beta" page, at time of writing).
* Use `200` in the number of optimization runs field (this is in `truffle.js`)
* "Contract name" field should **not** have `.sol` at the end
* You can find your compiler version by running: `cat build/contracts/LicenseCore.json | jq -r '.compiler.version'`
