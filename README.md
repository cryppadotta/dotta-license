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
  <img src="https://img.shields.io/badge/platform-Ethereum-brightgreen.svg?style=flat-square" alt="Ethereum" /> <img src="https://img.shields.io/badge/token-ERC721-ff69b4.svg?style=flat-square" alt="Token ERC721" /> <img src="https://img.shields.io/badge/contributions-welcome-orange.svg?style=flat-square" alt="Contributions Welcome" /> <img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="MIT License" /> <a href="https://travis-ci.org/cryppadotta/dotta-license"><img src="https://travis-ci.org/cryppadotta/dotta-license.svg?branch=master&style=flat-square" alt="Travis CI" /></a> <a href="https://t.me/dotlicense"> <img src="https://img.shields.io/badge/Join%20Us%20On-Telegram-2599D2.svg?style=flat-square" alt="Join Us On Telegram" /></a>
</div>

<div align="center">
  <sub>Built by
  <a href="https://twitter.com/cryppadotta">Dotta</a> and
  <a href="https://github.com/cryppadotta/dotta-license/graphs/contributors">
    contributors
  </a>
</div>

# Overview

Dotlicense is a set of smart contracts and JavaScript tooling to sell and verify software licenses (e.g. **in-app-purchases** or **feature access tokens**) using Ethereum. It supports both single purchase and (prepaid) subscriptions.

The licenses are [ERC721-compatible Tokens](http://erc721.org/). The client app holds the private key that owns the token.

The benefits are:

1. **Piracy deterring** -- Because the private key is used to validate the license, owners are dis-incentivized to share that key. Because if the key is shared, for example, on a file-sharing site the license can be transferred, stolen, and sold.
1. **Surveillance free** -- There is no "license server" tracking the user. Ownership of the token is validated by any [Web3 provider](https://web3js.readthedocs.io/en/1.0/web3.html#setprovider) (e.g. [Infura](https://infura.io/) or even a self-hosted node)
1. **Scarce** -- The number of licenses available for a given product can be limited
1. **Transferable** -- Users can transfer or resell their licenses (e.g. they can be auctioned on sites such as [Rarebits](https://rarebits.io/) or [OpenSea](https://opensea.io/))
1. **Cryptocurrency-based** -- Normal-cryptocurrency benefits apply such as near-instant payments, permissionless, decentralized ownership, etc. No approvals, Stripe, Shopify store, or bank account necessary.

It is designed for software licenses in desktop or mobile apps. (And there [is discussion](https://github.com/cryppadotta/dotta-license/issues/2) about using it for subscription web apps.)

# Features

* **Multiple products** - Each product has its own inventory levels and total supply, housed in one contract
* **Subscriptions** - Products can (optionally) expire and be renewed by paying additional funds
* **Affiliate program** - Affiliates can get a cut of sales they refer with individual, whitelisted rates (including recurring affiliate revenue with subscriptions)
* **Roles-based permissions** - The store has three roles: CEO, CFO, and COO
* **Full ERC-721 Compatibility** - Each license issued is also an ERC-721-compatible token
* **CLI Admin Tools** - With [Ledger hardware wallet](https://www.ledgerwallet.com/) support
* **Embeddable Web3 Checkout** - UMD JavaScript checkout button with [Metamask](https://github.com/MetaMask) support

# Implementations

Dotlicense is being used in [Dottabot](https://www.dottabot.com/), a cryptocurrency trailing-profit stop bot built with [Electron](https://electronjs.org/).

# Packages

Dotlicense is split into several packages:

* [`dot-license-contracts`](dot-license-contracts/README.md) holds the Solidity smart contracts that manage the sale and ownership of tokens
* [`dot-license-cli`](dot-license-cli/README.md) is the CLI admin tools for managing the smart contracts
* [`dot-license-verifier`](#COMING_SOON) (open-sourced soon) is a JavaScript wrapper library for client apps that need to list products that are owned, verify the licenses, etc.
* [`dot-license-checkout`](#COMING_SOON) (open-sourced soon) a customer checkout page for purchases using Metamask and React

Additionally, this repo stores some utilities we've built along the way such as:

* [`dot-abi-cli`](dot-abi-cli/README.md) - Generates a DApp CLI scaffold from an ABI (with Ledger support)

# Purchase Model

There are two main models in the contracts:

* The `Product` - which defines a feature or set of features and
* The `License` - (the token) which defines ownership of an instance of a `Product`

And during operation we have:

* The _user_ (our customer) who is buying access to the features and
* The _client_ (our software) which runs our application and enables new features on verified ownership

### The `Product`s

`Product`s have:

* an `id`
* a `price`
* the quantity `available`
* the `totalSupply`
* the quantity `sold`

And optionally, if the product is a subscription, it may have:

* a renewal `interval`, e.g. 1 month or 1 year in seconds
* a `renewable` setting, which may be used to disable renewals of old plans

The client unlocks features of a given `Product` `id` if ownership of a _`License`_ is proven.

When a new product is created, the `totalSupply` is fixed and **cannot be changed**. A `totalSupply` of `0` means "unlimited".

When a new product is created, the renewal `interval` is fixed and **cannot be changed**. An `interval` of `0` means "unlimited".

The executives can:

* Create new `Product`s
* Change the price for future sales of a `Product`
* Change the inventory amount `available` **as long as it does not violate the `totalSupply`**
* Change the product's `renewable` status

### The `License`

The `License` represents ownership of one unit of a `Product`. The `License` is the same as a "token" - they have the same ID and the two are used interchangeably.

`License`s have:

* an `id`
* a `productId`, which points to the `Product` this `License` is for
* `attributes` (`uint256`), which are specific to this individual `License`
* `issuedTime`, which is the time when this `License` was created (i.e. minted)
* an owner

And optionally:

* an `expirationTime` when this `License` expires
* an `affiliate` address, who is credited for the original sale of this `License`

A `License` is created (that is, the token is minted) at time of sale. When a sale is made, the inventory for that `Product` is decremented and ownership is transferred to the `assignee`

An `expirationTime` of `0` means "does not expire".

The executives can:

* Issue promotional (free) `License`s, within the bounds of the supply
* Issue promotional (free) renewal of `Licenses`

### Ownership

The private key that owns the license must be readable by the client software.

In [Dottabot](https://www.dottabot.com) this private key is:

* generated automatically by the software on installation and
* kept in OS secret storage (such as Keychain on Mac or `libsecret` on Linux).

In Dottabot, this means that while it is encrypted on disk, it is also readable by the software without user interaction. (It can also be deployed onto a VPS where a hardware wallet may not be available.)

Of course, this raises the problem of funds at purchase: often our users will have an existing wallet that they spend from (and it won't be our application's private key).

To deal with this issue, we require the user input the `assignee` address at purchase time (that is, the address controlled by the client software). When the token is purchased, **ownership of the token is given to the private key controlled by our software**.

This helps fulfill the piracy deterrence requirement by incentivizing the user to keep the license private.

# Contracts Overview

<img align="right" src="https://i.imgur.com/nJGej5H.png" alt="Contract Inheritance Architecture" />

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

| function                         | CEO | CFO | COO | anyone |
| -------------------------------- | --- | --- | --- | ------ |
| **LicenseAccessControl**         |     |     |     |        |
| `setCEO`                         | ✔   |     |     |        |
| `setCFO`                         | ✔   |     |     |        |
| `setCOO`                         | ✔   |     |     |        |
| `setWithdrawalAddress`           | ✔   |     |     |        |
| `withdrawBalance`                | ✔   | ✔   |     |        |
| `pause`                          | ✔   | ✔   | ✔   |        |
| `unpause`                        | ✔   |     |     |        |
|                                  |     |     |     |        |
| **LicenseBase**                  |     |     |     |        |
| `licenseProductId`               |     |     |     | ✔      |
| `licenseAttributes`              |     |     |     | ✔      |
| `licenseIssuedTime`              |     |     |     | ✔      |
| `licenseExpirationTime`          |     |     |     | ✔      |
| `licenseAffiliate`               |     |     |     | ✔      |
| `licenseInfo`                    |     |     |     | ✔      |
|                                  |     |     |     |        |
| **LicenseInventory**             |     |     |     |        |
| `createProduct`                  | ✔   |     | ✔   |        |
| `incrementInventory`             | ✔   | ✔   | ✔   |        |
| `decrementInventory`             | ✔   | ✔   | ✔   |        |
| `clearInventory`                 | ✔   | ✔   | ✔   |        |
| `setPrice`                       | ✔   | ✔   | ✔   |        |
| `setRenewable`                   | ✔   | ✔   | ✔   |        |
| `priceOf`                        |     |     |     | ✔      |
| `availableInventoryOf`           |     |     |     | ✔      |
| `totalSupplyOf`                  |     |     |     | ✔      |
| `totalSold`                      |     |     |     | ✔      |
| `intervalOf`                     |     |     |     | ✔      |
| `renewableOf`                    |     |     |     | ✔      |
| `productInfo`                    |     |     |     | ✔      |
| `getAllProductIds`               |     |     |     | ✔      |
| `costForProductCycles`           |     |     |     | ✔      |
| `isSubscriptionProduct`          |     |     |     | ✔      |
|                                  |     |     |     |        |
| **LicenseOwnership** (ERC721)    |     |     |     |        |
| `name`                           |     |     |     | ✔      |
| `symbol`                         |     |     |     | ✔      |
| `implementsERC721`               |     |     |     | ✔      |
| `tokenMetadata`                  |     |     |     | ✔      |
| `supportsInterface`              |     |     |     | ✔      |
| `setTokenMetadataBaseURI`        | ✔   |     | ✔   |        |
| `totalSupply`                    |     |     |     | ✔      |
| `balanceOf`                      |     |     |     | ✔      |
| `tokensOf`                       |     |     |     | ✔      |
| `ownerOf`                        |     |     |     | ✔      |
| `getApproved`                    |     |     |     | ✔      |
| `isApprovedForAll`               |     |     |     | ✔      |
| `transfer`                       |     |     |     | ✔      |
| `approve`                        |     |     |     | ✔      |
| `approveAll`                     |     |     |     | ✔      |
| `disapproveAll`                  |     |     |     | ✔      |
| `takeOwnership`                  |     |     |     | ✔      |
| `transferFrom`                   |     |     |     | ✔      |
|                                  |     |     |     |        |
| **LicenseSale**                  |     |     |     |        |
| `setAffiliateProgramAddress`     | ✔   |     |     |        |
| `setRenewalsCreditAffiliatesFor` | ✔   |     |     |        |
| `createPromotionalPurchase`      | ✔   |     | ✔   |        |
| `createPromotionalRenewal`       | ✔   |     | ✔   |        |
| `purchase`                       |     |     |     | ✔      |
| `renew`                          |     |     |     | ✔      |
|                                  |     |     |     |        |
| **LicenseCore**                  |     |     |     |        |
| `setNewAddress`                  | ✔   |     |     |        |
| `unpause`                        | ✔   |     |     |        |

# Dotlicense Checkout

`dot-license-checkout` is a UMD (or React-component) library which embeds a Metamask-enabled checkout.

<div align="center">
  <img src="https://i.imgur.com/LNa0A7q.png"
  alt="dot-checkout" width="975"></a>
</div>

```javascript
// React Component 

const logo = require("path/to/logo.png");

const offers = [
  {
    productId: '1',
    duration: ONE_YEAR,
    name: '1 year',
    price: 0.15
  },
  {
    productId: '1',
    duration: ONE_YEAR * 2,
    name: '2 years',
    price: 0.15 * 2
  }
];

const config = {
  httpProviderURL: 'https://rinkeby.infura.io/98sadfnjncadlh8',
  licenseCoreAddress: '0xc3e2f9aADc4B5c467E0668C2d690a999A91A1a5C'
};

<DotLicenseCheckout
  productName="Dottabot"
  productSubheading="Unlimited License"
  offerLabel="Years:"
  offers={offers}
  logo={logo}
  httpProviderURL={config.httpProviderURL}
  licenseCoreAddress={config.licenseCoreAddress}
/>
```

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
  dot-license-cli.js getApproved <tokenId>                                        Gets the approved address to take ownership of a given token ID
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
  dot-license-cli.js isApprovedForAll <owner> <operator>                     Tells whether an operator is approved by a given owner
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

# Objections and Risks

Because licenses are verified on the client, this framework may be susceptible to at least two attacks: _cracking_ and _spoofing_.

### Cracking

Like any desktop, mobile, or client-run app it may be possible for a determined hacker to patch the binary in such a way as to bypass the verification mechanism. Over time, we expect to improve our deterrence methods, but cracking is always a risk.

### Spoofing

Because this software uses the Ethereum blockchain to verify ownership of a license-token, one could "spoof" ownership by directing their Web3 provider to a chain fork where they own a token, even when they may have transferred that token on the main net.

Again, we plan to implement a degree of 'main-chain' verification to make this difficult or cumbersome for an attacker to do. But forks are always a risk.

This attack could be mitigated by hosting your own Ethereum node and requiring pinning in your client app. However, the tradeoff here is by requiring the user to hit your server the user has reduced privacy and availability.

# FAQ

* **Q**: Is there a fee to use these contracts?
* **A**: No. This software is free to use and there are no "rents" extracted that go back to the Dotlicense team. (Of course, if you use the contracts, Ethereum transactions have fees.)

* **Q**: Why must the client-software hold the private-key ownership of the tokens? Wouldn't it be better for the token to specify the 'allowed client' but restrict transfer to user-held key? This way a user could hold their license-tokens in e.g. a hardware wallet
* **A**: If the user held the ownership private key independently, they could freely share a license key with no consequences. When the client application requires the private key, then there is incentive to keep it private (because otherwise the license may be stolen.)

* **Q**: Why are these NFTs and not ERC20 fungible tokens?
* **A**: Because each individual license has it's own attributes. These tokens are somewhat of a hybrid in that you may sell multiple copies of the same feature. However, the tokens aren't fully fungible either -- they each hold unique attributes.

* **Q**: Do I have to pay affiliates?
* **A**: No. Affiliates have a baseline rate, which can be zero. Individual affiliates can be whitelisted

# Configuring and deploying

_(Coming soon)_

# Join Us On Telegram

If you're interested in using or developing Dotlicense, come [join us on Telegram](https://t.me/dotlicense)

# Built With

* [OpenZeppelin](https://github.com/OpenZeppelin/zeppelin-solidity)
* [Truffle](https://truffleframework.com)
* [Ledgerjs](https://github.com/LedgerHQ/ledgerjs)
* [Web3.js](https://github.com/ethereum/web3.js/)

With inspiration from:

* [0x](https://github.com/0xProject/0x.js)
* [Cryptokitties](https://github.com/axiomzen/cryptokitties-bounty)

# Authors

Originally created by [Dotta](https://twitter.com/cryppadotta) for [Dottabot](https://www.dottabot.com)

# License

[MIT](https://opensource.org/licenses/MIT)
