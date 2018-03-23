# dot-license-contracts

Part of [Dotlicense](../README.md). See that file for an overview of the project as well as the contract architecture.

## Building ABI

If you need to rebuild the ABI, you can do it with the following command:

    # requires docker
    make build-abi

This will generate a _combined_ ABI that includes the abi, devdoc, and userdoc.

## Deploying the Contracts

## Gas Estimates

You can [view the current gas estimates here](doc/gas-estimates.txt).

You can generate the gas estimates with the following command:

    make gas-estimates
