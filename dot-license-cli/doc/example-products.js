/**
 * This is an example of a products inventory file that can be used with the
 * `sync-products` command.
 *
 * For example:
 * node bin/dot-license-cli.js sync-products --products doc/example-products.js
 *
 * This will automatically:
 * * create products
 * * sync price
 * * sync renewable
 *
 */
module.exports = (argv, _require) => {
  const web3Util = _require('web3-utils');
  const toWei = web3Util.toWei;
  const BN = web3Util.BN;

  const monthlyEthToYearlyWei = ethPerMonth =>
    new BN(toWei(ethPerMonth, 'ether')).mul(new BN(12)).toString();

  const ONE_DAY = 60 * 60 * 24;
  const ONE_MONTH = ONE_DAY * 30;
  const ONE_YEAR = ONE_MONTH * 12;

  return [
    // Beta Users
    {
      name: 'Beta Users',
      productId: '1',
      price: 0,
      initialInventoryQuantity: 0,
      supply: 50,
      interval: 0,
      renewable: false,
    },

    // Starter
    {
      name: 'Starter Monthly',
      productId: '2',
      price: toWei('0.046', 'ether'),
      initialInventoryQuantity: 98,
      supply: 500,
      interval: ONE_MONTH,
      renewable: true,
    },
    {
      name: 'Starter Yearly',
      productId: '3',
      price: monthlyEthToYearlyWei('0.036'),
      initialInventoryQuantity: 99,
      supply: 500,
      interval: ONE_YEAR,
      renewable: true,
    },

    // Trader
    {
      name: 'Trader Monthly',
      productId: '4',
      price: toWei('0.12', 'ether'),
      initialInventoryQuantity: 86,
      supply: 500,
      interval: ONE_MONTH,
      renewable: true,
    },
    {
      name: 'Trader Yearly',
      productId: '5',
      price: monthlyEthToYearlyWei('0.086'),
      initialInventoryQuantity: 98,
      supply: 500,
      interval: ONE_YEAR,
      renewable: true,
    },

    // Pro
    {
      name: 'Pro Monthly',
      productId: '6',
      price: toWei('0.22', 'ether'),
      initialInventoryQuantity: 52,
      supply: 300,
      interval: ONE_MONTH,
      renewable: true,
    },
    {
      name: 'Pro Yearly',
      productId: '7',
      price: monthlyEthToYearlyWei('0.176'),
      initialInventoryQuantity: 59,
      supply: 300,
      interval: ONE_YEAR,
      renewable: true,
    },

    // Unlimited
    {
      name: 'Unlimited Monthly',
      productId: '8',
      price: toWei('0.68', 'ether'),
      initialInventoryQuantity: 40,
      supply: 250,
      interval: ONE_MONTH,
      renewable: true,
    },
    {
      name: 'Unlimited Yearly',
      productId: '9',
      price: monthlyEthToYearlyWei('0.5'),
      initialInventoryQuantity: 40,
      supply: 250,
      interval: ONE_YEAR,
      renewable: true,
    },
  ];
};
