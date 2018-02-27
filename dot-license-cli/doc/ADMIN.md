# dotlicense-cli - managing your store

## Setting up

Assuming you've deployed the contracts somewhere, you now need to configure.

```bash
# get basic info
node bin/dotlicense-cli.js info --inventory

# create a product
node bin/dotlicense-cli.js createProduct 1 100000000000000000 0 5

# check for inventory again (see above)

# if you have zero inventory, you need to add some
node bin/dotlicense-cli.js incrementInventory 1 3
```

When you're ready to use it, you have to unpause

```bash
# unpause
node bin/dotlicense-cli.js unpause

# buy a product
node bin/dotlicense-cli.js --value 100000000000000000 purchase 1 0xf57d1e1451c034992e79ba2002b06bf91377d131 0

```


