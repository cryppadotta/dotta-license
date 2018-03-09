# dotlicense-cli - managing your store

## Configuration

```bash
# Create an environment config
cp .env.network.example .env.rinkeby

# Edit the file with your settings...

# Then set NODE_ENV with the network you want to use
export NODE_ENV=rinkeby
```

## Setting up

> These commands assume you've already deployed the contracts. These
> instructions describe how to configure the store

```bash
# To get an overview of the commands run:
node bin/dot-license-cli.js --help

# get basic info about your deployed contract (sanity check)
node bin/dot-license-cli.js info --inventory

# create a product
# To calculate your price in wei, fire up a geth node and type: web3.toWei(0.1, "ether")
node bin/dot-license-cli.js createProduct 1 100000000000000000 5 10 0

# Confirm it worked by checking for inventory again
node bin/dot-license-cli.js info --inventory

# if you have zero inventory, you need to add some
node bin/dot-license-cli.js incrementInventory 1 3
```

Now setup the affiliate program

```bash
# set the address
node bin/dot-license-cli.js setAffiliateProgramAddress abc123

# Confirm it worked
node bin/dot-license-cli.js info

# now we switch to calling on the affiliate program contract
# set the baseline rate
node bin/dot-affiliate-cli.js setBaselineRate 1000

# unpause the affiliate program contract
node bin/dot-affiliate-cli.js unpause

# Confirm it worked (note that this is a different script than before)
node bin/dot-affiliate-cli.js info
```

When you're ready to use it, you have to unpause the main contract

```bash
# unpause
node bin/dot-license-cli.js unpause

# buy a product
node bin/dot-license-cli.js --value 1000000000000000 purchase 1 1 0xTO 0xAFFILIATE
```
