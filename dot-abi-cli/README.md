# dot-abi-cli

Generate a DApp CLI scaffold from an ABI

(with Ledger hardware wallet support)

## Usage

* See: dotlicense-cli

## Generating a combined ABI file

This generator uses a "combined" ABI file, merging `abi`, `devdoc`, and `userdoc`. You must use `solc` (and not `solcjs`) for this.

The easiest way is to use Docker like this:

```shell
docker run -v "$PWD/contracts":/contracts ethereum/solc:stable --combined-json abi,devdoc,userdoc --pretty-json /contracts/Contract1.sol /contracts/Contract2.sol > ../pathTo/MyCombined.abi.json
```

## Environment variables

* `WEB3_PROVIDER_URL`
* `GAS_PRICE`
* `GAS_LIMIT`
* `NETWORK_ID`

## Similar Projects

* [seth](https://github.com/dapphub/seth)
