# dotlicense-cli - managing your store

## Setting up

Assuming you've deployed the contracts somewhere, you now need to configure.

```bash
# get basic info
node bin/dot-license-cli.js info --inventory

# create a product
node bin/dot-license-cli.js createProduct 1 100000000000000000 2 5

# check for inventory again (see above)

# if you have zero inventory, you need to add some
node bin/dot-license-cli.js incrementInventory 1 3
```

Now setup the affiliate program

```bash
# set the address
node bin/dot-license-cli.js setAffiliateProgramAddress abc123

# now we switch to calling on the affiliate program contract
# set the baseline rate
node bin/dot-affiliate-cli.js setBaselineRate 1000

# unpause the affiliate program contract
node bin/dot-affiliate-cli.js unpause

```

When you're ready to use it, you have to unpause the main contract

```bash
# unpause
node bin/dot-license-cli.js unpause

# buy a product
node bin/dot-license-cli.js --value 1000000000000000 purchase 1 0x6BF229FC56F0EF7E97eb6BAa750F25DeA23B80d7 0x159cb8dc7e2e4ab230a5707cfff771a9c9d7403d
```


