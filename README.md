<h1 align="center">
  <img src="https://i.imgur.com/Cp9BmvE.png" 
srcset="https://i.imgur.com/HvP6jpJ.png 2x"
  alt="Dotlicense" width="970"></a>
</h1>

<h3 align="center">Dotlicense - Decentralized software licensing</h3>
<div align="center">
  An Ethereum ERC721-based software licensing framework.
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

# Features

* 

