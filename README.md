<h1 align="center">
  <img src="https://i.imgur.com/Cp9BmvE.png" 
srcset="https://i.imgur.com/HvP6jpJ.png 2x"
  alt="Dotlicense" width="970"></a>
</h1>

<h3 align="center">Decentralized software licensing</h3>
<div align="center">
  Dotlicense is an Ethereum ERC721-based software licensing framework.
</div>

<br />

<div align="center">
  <img src="https://img.shields.io/badge/platform-Ethereum-brightgreen.svg?style=flat-square"
      alt="Ethereum" />

  <img src="https://img.shields.io/badge/token-ERC721-ff69b4.svg?style=flat-square"
      alt="Token ERC721" />

  <img src="https://img.shields.io/badge/contributions-welcome-orange.svg?style=flat-square"
      alt="Contributions Welcome" />

  <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square"
      alt="MIT License" />

  <a href="https://t.me/dotlicense"><img src="https://img.shields.io/badge/Join%20Us%20On-Telegram-2599D2.svg?style=flat-square"
      alt="Join Us On Telegram" /></a>
</div>

<div align="center">
  <sub>Built by 
  <a href="https://twitter.com/cryppadotta">Dotta</a> and
  <a href="https://github.com/cryppadotta/dotta-license/graphs/contributors">
    contributors
  </a>
</div>

# Overview

Dotlicense is a set of smart contracts and JavaScript tooling to sell and verify software licenses (e.g. **in-app-purchases** or **feature access tokens**) using Ethereum.

The licenses are [ERC721-compatible Tokens](http://erc721.org/). The client app holds the private key that owns the token.

The benefits are:

1. **Piracy deterring** -- Because the private key is used to validate the license, owners are dis-incentivized to share that key. Because if the key is shared, for example, on a file-sharing site the license can be transferred, stolen, and sold.
1. **Surveillance free** -- There is no "license server" tracking the user. Ownership of the token is validated by any [Web3 provider](https://web3js.readthedocs.io/en/1.0/web3.html#setprovider) (e.g. [Infura](https://infura.io/) or even a self-hosted node)
1. **Scarce** -- The number of licenses available for a given product can be limited
1. **Transferable** -- Users can transfer or resell their licenses (e.g. they can be auctioned on sites such as [Rarebits](https://rarebits.io/))

It is designed for software licenses in desktop or mobile apps.

# Features

* **Multiple products** - Each product has its own inventory levels and total supply, housed in one contract
* **Affiliate program** - Affiliates can get a cut of sales they refer with individual, whitelisted rates
* **Roles-based permissions** - The store has three roles: CEO, CFO, and COO
* **Full ERC-721 Compatibility** - Each license issued is also an ERC-721-compatible token
* **CLI Admin Tools** - With Ledger hardware wallet support

# Implementations

Dotlicense is being used in [Dottabot](https://www.dottabot.com/), a cryptocurrency trailing-profit stop bot built with [Electron](https://electronjs.org/).

# Packages

Dotlicense is split into several packages:

* [`dot-license-contracts`](dot-license-contracts/README.md) holds the Solidity smart contracts that manage the sale and ownership of tokens
* [`dot-license-cli`](dot-license-cli/README.md) is the CLI admin tools for managing the smart contracts
* [`dot-license-js`](#COMING_SOON) (coming soon) is a JavaScript wrapper library for client apps that need to list products that are owned, verify the licenses, etc.
* [`dot-license-store`](#COMING_SOON) (coming soon) a customer checkout page for purchases using Metamask and React

Additionally, this repo stores some utilities we've built along the way such as:

* [`dot-abi-cli`](dot-abi-cli/README.md) - Generates a DApp CLI scaffold from an ABI (with Ledger support)

# Contracts Overview

<div align="right">
  <img src="https://i.imgur.com/nJGej5H.png" alt="Contract Inheritance Architecture" />
</div>

The smart contracts are split into modules.

* [`LicenseAccessControl`](dot-license-contracts/contracts/LicenseAccessControl.sol) - Defines the organizational roles and permission
* [`LicenseBase`](dot-license-contracts/contracts/LicenseBase.sol) - Defines the `License` struct and storage
* [`LicenseInventory`](dot-license-contracts/contracts/LicenseInventory.sol) - Controls the `Product`s and inventory for those `Product`s
* [`LicenseOwnership`](dot-license-contracts/contracts/LicenseOwnership.sol) - Implements ERC721 and defines ownership and transfer rights
* [`LicenseSale`](dot-license-contracts/contracts/LicenseSale.sol) - Implements minting tokens when a sale happens
* [`LicenseCore`](dot-license-contracts/contracts/LicenseCore.sol) - Is the core contract that is deployed to the network

* [`AffiliateProgram`](dot-license-contracts/contracts/Affiliate/AffiliateProgram.sol) - Defines a minimal affiliate program, with whitelisting

# Roles-based Permissions

Issuance of new products and unsold inventory levels is centrally controlled. There are three roles:

* CEO
* CFO and
* COO

Some of the smart contract functions are open to anyone and some are restricted by role. The table below shows the permissions for each:

| function                      | CEO | CFO | COO | anyone |
| ----------------------------- | --- | --- | --- | ------ |
| **LicenseAccessControl**      |     |     |     |        |
| `setCEO`                      | ✔   |     |     |        |
| `setCFO`                      | ✔   |     |     |        |
| `setCOO`                      | ✔   |     |     |        |
| `setWithdrawalAddress`        | ✔   |     |     |        |
| `withdrawBalance`             | ✔   | ✔   |     |        |
| `pause`                       | ✔   | ✔   | ✔   |        |
| `unpause`                     | ✔   |     |     |        |
|                               |     |     |     |        |
| **LicenseBase**               |     |     |     |        |
| `licenseProductId`            |     |     |     | ✔      |
| `licenseAttributes`           |     |     |     | ✔      |
| `licenseIssuedTime`           |     |     |     | ✔      |
| `licenseInfo`                 |     |     |     | ✔      |
|                               |     |     |     |        |
| **LicenseInventory**          |     |     |     |        |
| `createProduct`               | ✔   |     | ✔   |        |
| `incrementInventory`          | ✔   | ✔   | ✔   |        |
| `decrementInventory`          | ✔   | ✔   | ✔   |        |
| `clearInventory`              | ✔   | ✔   | ✔   |        |
| `setPrice`                    | ✔   | ✔   | ✔   |        |
| `priceOf`                     |     |     |     | ✔      |
| `availableInventoryOf`        |     |     |     | ✔      |
| `totalSupplyOf`               |     |     |     | ✔      |
| `totalSold`                   |     |     |     | ✔      |
| `productInfo`                 |     |     |     | ✔      |
| `getAllProductIds`            |     |     |     | ✔      |
|                               |     |     |     |        |
| **LicenseOwnership** (ERC721) |     |     |     |        |
| `name`                        |     |     |     | ✔      |
| `symbol`                      |     |     |     | ✔      |
| `implementsERC721`            |     |     |     | ✔      |
| `supportsInterface`           |     |     |     | ✔      |
| `totalSupply`                 |     |     |     | ✔      |
| `balanceOf`                   |     |     |     | ✔      |
| `tokensOf`                    |     |     |     | ✔      |
| `ownerOf`                     |     |     |     | ✔      |
| `approvedFor`                 |     |     |     | ✔      |
| `isOperatorApprovedFor`       |     |     |     | ✔      |
| `transfer`                    |     |     |     | ✔      |
| `approve`                     |     |     |     | ✔      |
| `approveAll`                  |     |     |     | ✔      |
| `disapproveAll`               |     |     |     | ✔      |
| `takeOwnership`               |     |     |     | ✔      |
| `transferFrom`                |     |     |     | ✔      |
|                               |     |     |     |        |
| **LicenseSale**               |     |     |     |        |
| `setAffiliateProgramAddress`  | ✔   |     |     |        |
| `createPromotionalPurchase`   |     |     | ✔   |        |
| `purchase`                    |     |     |     | ✔      |
|                               |     |     |     |        |
| **LicenseCore**               |     |     |     |        |
| `setNewAddress`               | ✔   |     |     |        |
| `unpause`                     | ✔   |     |     |        |


# CLI Tools

<div align="center">
  <img src="https://i.imgur.com/1MRZQuU.png" alt="dot-license-cli" />
</div>

The CLI Admin tool has the following commands:

```bash
$ node ./bin/dot-license-cli.js --help
Usage: dot-license-cli.js <command> [options]

Commands:
  dot-license-cli.js affiliateProgram                                             Get the affiliate program address
  dot-license-cli.js approve <to> <tokenId>                                       Approves another address to claim for the ownership of the given token ID
  dot-license-cli.js approveAll <to>                                              Approves another address to claim for the ownership of any tokens owned by
                                                                                  this account
  dot-license-cli.js approvedFor <tokenId>                                        Gets the approved address to take ownership of a given token ID
  dot-license-cli.js availableInventoryOf <productId>                             The available inventory of a product
  dot-license-cli.js balanceOf <owner>                                            Gets the balance of the specified address
  dot-license-cli.js ceoAddress                                                   Get the CEO's Address
  dot-license-cli.js cfoAddress                                                   Get the CFO's Address
  dot-license-cli.js clearInventory <productId>                                   clearInventory clears the inventory of a product.
  dot-license-cli.js cooAddress                                                   Get the COOs address
  dot-license-cli.js createProduct <productId> <initialPrice>                     createProduct creates a new product in the system
  <initialInventoryQuantity> <supply>
  dot-license-cli.js decrementInventory <productId> <inventoryAdjustment>         decrementInventory removes inventory levels for a product
  dot-license-cli.js disapproveAll <to>                                           Removes approval for another address to claim for the ownership of any
                                                                                  tokens owned by this account.
  dot-license-cli.js getAllProductIds                                             Get all product ids
  dot-license-cli.js incrementInventory <productId> <inventoryAdjustment>         incrementInventory - increments the inventory of a product
  dot-license-cli.js isOperatorApprovedFor <owner> <operator>                     Tells whether an operator is approved by a given owner
  dot-license-cli.js licenseAttributes <licenseId>                                Get a license's attributes
  dot-license-cli.js licenseInfo <licenseId>                                      Get a license's info
  dot-license-cli.js licenseIssuedTime <licenseId>                                Get a license's issueTime
  dot-license-cli.js licenseProductId <licenseId>                                 Get a license's productId
  dot-license-cli.js name                                                         token's name
  dot-license-cli.js newContractAddress                                           Gets the new contract address
  dot-license-cli.js ownerOf <tokenId>                                            Gets the owner of the specified token ID
  dot-license-cli.js pause                                                        called by any C-level to pause, triggers stopped state
  dot-license-cli.js paused                                                       Checks if the contract is paused
  dot-license-cli.js priceOf <productId>                                          The price of a product
  dot-license-cli.js productInfo <productId>                                      The product info for a product
  dot-license-cli.js purchase <productId> <assignee> <affiliate>                  Purchase - makes a purchase of a product. Requires that the value sent is
                                                                                  exactly the price of the product
  dot-license-cli.js setAffiliateProgramAddress <address>                         executives *
  dot-license-cli.js setCEO <newCEO>                                              Sets a new CEO
  dot-license-cli.js setCFO <newCFO>                                              Sets a new CFO
  dot-license-cli.js setCOO <newCOO>                                              Sets a new COO
  dot-license-cli.js setNewAddress <v2Address>                                    Sets a new contract address
  dot-license-cli.js setPrice <productId> <price>                                 setPrice - sets the price of a product
  dot-license-cli.js setWithdrawalAddress <newWithdrawalAddress>                  Sets a new withdrawalAddress
  dot-license-cli.js symbol                                                       symbols's name
  dot-license-cli.js takeOwnership <tokenId>                                      Claims the ownership of a given token ID
  dot-license-cli.js tokensOf <owner>                                             Gets the list of tokens owned by a given address
  dot-license-cli.js totalSold <productId>                                        The total sold of a product
  dot-license-cli.js totalSupply                                                  Gets the total amount of tokens stored by the contract
  dot-license-cli.js totalSupplyOf <productId>                                    The total supply of a product
  dot-license-cli.js transfer <to> <tokenId>                                      Transfers the ownership of a given token ID to another address
  dot-license-cli.js transferFrom <from> <to> <tokenId>                           Transfer a token owned by another address, for which the calling address
                                                                                  has previously been granted transfer approval by the owner.
  dot-license-cli.js unpause                                                      Unpause the contract
  dot-license-cli.js withdrawBalance                                              Withdraw the balance to the withdrawalAddress
  dot-license-cli.js withdrawalAddress                                            Get the withdrawal address
  dot-license-cli.js info                                                         Describe contract info

Options:
  --web3              web3 provider url                                                                                   [default: "http://localhost:8545"]
  --from              from address
  --gasPrice          gas price in wei to use for this transaction                                                                   [default: "1000000000"]
  --gasLimit          maximum gas provided for this transaction                                                                         [default: "6500000"]
  --value             The value transferred for the transaction in wei
  --contract-address  address to contract                                                 [required] [default: "0xb4f53a030f9d088198cdb66b8ad95aa79a95868f"]
  --network-id        The network ID                                                                                                        [default: "101"]
  --ledger            use a ledger                                                                                                                 [boolean]
  --hd-path           hd-path (used for hardware wallets)                                                                          [default: "44'/60'/0'/0"]
  --help              Show help                                                                                                                    [boolean]
  --version           Show version number                                                                                                          [boolean]
```

# Built With

* [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity)
* [Truffle](https://truffleframework.com)
* [Ledgerjs](https://github.com/LedgerHQ/ledgerjs)
* [Web3.js](https://github.com/ethereum/web3.js/)

With inspiration from:

* [0x](https://github.com/0xProject/0x.js)
* [Cryptokitties](https://github.com/axiomzen/cryptokitties-bounty)

# Join Us On Telegram

If you're interested in using or developing Dotlicense, come [join us on Telegram](https://t.me/dotlicense)

# Authors

Originally created by [Dotta](https://twitter.com/cryppadotta) for [Dottabot](https://www.dottabot.com)

# License

[MIT](https://opensource.org/licenses/MIT)
