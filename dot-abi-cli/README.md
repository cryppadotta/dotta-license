# dot-abi-cli

Generate a DApp CLI scaffold from an ABI

(with Ledger hardware wallet support)

## Usage

`dot-abi-cli` is a _framework_ for building commandline tools.

The core steps are:

* Generate a combined ABI
* Create an entrypoint command
* Load your environment variables

## Automatic Command Generation

Commands are only generated for methods that have solc documentation. For example, a method like this:

```solidity
  /**
  * @notice Makes a purchase of a product.
  * @dev Requires that the value sent is exactly the price of the product
  * @param _productId - the product to purchase
  * @param _numCycles - the number of cycles being purchased. This number should be `1` for non-subscription products and the number of cycles for subscriptions.
  * @param _assignee - the address to assign the purchase to (doesn't have to be msg.sender)
  * @param _affiliate - the address to of the affiliate - use address(0) if none
  */
  function purchase(
    uint256 _productId,
    uint256 _numCycles,
    address _assignee,
    address _affiliate
    )
    external
    payable
    whenNotPaused
    returns (uint256)
  {
    require(_productId != 0);
    require(_numCycles != 0);
    // ...
```

Becomes a command, which appears in help like this:

```
dot-license-cli.js purchase <productId> <numCycles> <assignee> <affiliate>  Makes a purchase of a product.
```

This command could be run as:

```
dot-license-cli.js purchase 1 4 0xdeadbeef 0xdeadbeef --value 12345
```

## Cryptokitties CLI Example

Consider the [cryptokitties-cli example](./examples/cryptokitties-cli)

<h1 align="center">
  <img src="https://i.imgur.com/nqJInrI.png"
  alt="Cryptokitties CLI Help" width="970"></a>
</h1>

1.  Generate a **combined ABI**

e.g. something like:

```shell
docker run -v "$PWD/contracts":/contracts ethereum/solc:stable --combined-json abi,devdoc,userdoc --pretty-json /contracts/KittyCore.sol > ../pathTo/MyCombined.abi.json
```

2.  Create the command entry point as in [`cryptokitties-cli.js`](cryptokitties-cli.js)

This file loads the ABI and creates a commandline tool using the `builder`. The `builder` uses [`yargs`](https://github.com/yargs/yargs) and can be extended accordingly.

This file also configures the Web3 provider. You can use any provider you wish.

3.  Create a `.env` file that contains the necessary environment variables:

```
# .env

KEY_MNEMONIC="my dog has fleas and he goes to church"
WEB3_PROVIDER_URL=https://mainnet.infura.io/remix
NETWORK_ID=1
GAS_PRICE=1000000010
GAS_LIMIT=4700000
CONTRACT_ADDRESS=0x06012c8cf97BEaD5deAe237070F9587f8E7A266d
```

(This example uses `dotenv`, but of course, you can provide these variables any way you'd like.)

4.  Try it out:

```bash
npm install
./node_modules/.bin/babel-node cryptokitties-cli.js --help

# ... help results ...

./node_modules/.bin/babel-node cryptokitties-cli.js getKitty 3

Result {
  '0': false,
  '1': true,
  '2': '0',
  '3': '0',
  '4': '0',
  '5': '1511417999',
  '6': '0',
  '7': '0',
  '8': '0',
  '9': '516352335416235417056702290154738622491807922722465690508248901653769675',
  isGestating: false,
  isReady: true,
  cooldownIndex: '0',
  nextActionAt: '0',
  siringWithId: '0',
  birthTime: '1511417999',
  matronId: '0',
  sireId: '0',
  generation: '0',
  genes: '516352335416235417056702290154738622491807922722465690508248901653769675'
}
```

## Additional Configuration

For methods (or accessors) that have no documentation, we can provide a configuration manually.

See [`dot-license-cli.js`](../dot-license-cli/bin/dot-license-cli.js) for an example of this.

## Examples

* [Simple: Cryptokitties example](./examples/cryptokitties-cli)
* [Advanced: dotlicense-cli](../dot-license-cli)

## Generating a combined ABI file

This generator uses a "combined" ABI file, merging `abi`, `devdoc`, and `userdoc`. You must use `solc` (and not `solcjs`) for this.

The easiest way is to use Docker like this:

```shell
docker run -v "$PWD/contracts":/contracts ethereum/solc:stable --combined-json abi,devdoc,userdoc --pretty-json /contracts/Contract1.sol /contracts/Contract2.sol > ../pathTo/MyCombined.abi.json
```

## Similar Projects

* [seth](https://github.com/dapphub/seth)

# Authors

Originally created by [Dotta](https://twitter.com/cryppadotta) for [Dottabot](https://www.dottabot.com)

# License

[MIT](https://opensource.org/licenses/MIT)
