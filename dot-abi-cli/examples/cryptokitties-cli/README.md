# Cryptokitties CLI

> An example project showing how to use `dot-abi-cli` as a library

<h1 align="center">
  <img src="https://i.imgur.com/nqJInrI.png"
  alt="Cryptokitties CLI Help" width="970"></a>
</h1>

1.  Generate a **combined ABI**

e.g. something like:

```shell
docker run -v "$PWD/contracts":/contracts ethereum/solc:stable --combined-json abi,devdoc,userdoc --pretty-json /contracts/KittyCore.sol > KittyCore.combined.abi.json
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
node cryptokitties-cli.js --help

# ... help results ...

node cryptokitties-cli.js getKitty 3

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
  genes: '516352335416235417056702290154738622491807922722465690508248901653769675' }
```
