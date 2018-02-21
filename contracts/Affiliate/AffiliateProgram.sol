pragma solidity ^0.4.19;

import '../math/SafeMath.sol';
import '../math/Math.sol';
import '../lifecycle/Pausable.sol';

/**

* Affiliate whitelisting
* Affilite base-rate - will go to any address, if they withdraw
* Track affiliate sales
* Track soldAt date -- because we can withdraw their funds after 30 days
* Set individual affiliate rates, whitelisting and blacklisting
* pause the program
* set the licensing

How about this, instead of requiring a withdraw for every sale

the goal is that no money is sitting in the contract unclaimed for longer
than 30 days

so instead, let's create a withdraw and a withdrawFrom method
and withdrawFrom has a conditon that 30 days must have passed

also, we require that the comission paid is greater than zero to change
the date. this means, we're only able to withdraw a dormant link

e.g. if someone has a link that is actively driving traffic, then there's
nothing we can do. but if their link has not driven any traffic for 30 days
and they have not withdrawn the data for 30 days, then we have the right to
withdraw it

 */
contract AffiliateProgram is Pausable {
  using SafeMath for uint256;

  event AffiliateSale(
    // The address of the affiliate
    address affiliate,
    // The store's ID of what was sold (e.g. a tokenId)
    uint256 productId,
    // The amount owed this affiliate in this sale
    uint256 amount
  );

  event Withdraw(address affiliate, address to, uint256 amount);
  event Whitelisted(address affiliate, uint256 rate);
  event BaselineRate(uint256 rate);
  event MaximumRate(uint256 rate);

  // A mapping from affiliate address to their balance
  mapping (address => uint256) public balances;

  // A mapping from affiliate address to the time of last deposit
  mapping (address => uint256) public lastDeposit;

  // The hard-coded maximum affiliate rate (in basis points)
  // All rates are measured in basis points (1/100 of a percent)
  // Values 0-10,000 map to 0%-100%
  uint256 private constant hardCodedMaximumRate = 5000;

  // The baseline affiliate rate (in basis points) for non-whitelisted referrals
  uint256 public baselineRate = 0;

  // A mapping from whitelisted referrals to their individual rates
  mapping (address => uint256) public whitelistRates;

  // The maximum rate for any affiliate -- overrides individual rates
  // This can be used to clip the rate used in bulk, if necessary
  uint256 public maximumRate = 5000;

  // The address of the store selling products
  address public storeAddress;

  /**
   * @dev Modifier to make a function only callable by the store or the owner
   */
  modifier onlyStoreOrOwner() {
    require(msg.sender == storeAddress ||
            msg.sender == owner);
    _;
  }

  function AffiliateProgram(address _storeAddress) {
    storeAddress = _storeAddress;
    paused = true;
  }

  function isAffiliateProgram() public view returns (bool) {
    return true;
  }

  /**
   * @dev rateFor returns the rate which should be used to calculate the comission
   *  for this affiliate/sale combination.
   *  We may want to completely blacklist a particular address (e.g. a known bad actor affilite).
   *  To that end, if the whitelistRate is exactly 1bp, we use that as a signal for blacklisting
   *  and return a rate of zero. The upside is that we can completely turn off
   *  sending transactions to a particular address when this is needed. The
   *  downside is that you can't issued 1/100th of a percent commission.
   *  However, since this is such a small amount its an acceptable tradeoff.
   *
   * @param affiliate - the address of the affiliate to check for
   * @param productId - the productId in the sale
   * @param purchaseId - the purchaseId in the sale
   * @param purchaseAmount - the purchaseAmount
   */
  function rateFor(
    address affiliate,
    uint256 productId,
    uint256 purchaseId,
    uint256 purchaseAmount
  )
    public view returns (uint256) {
      uint256 whitelistedRate = whitelistRates[affiliate];
      if(whitelistedRate > 0) {
        // use 1 bp as a blacklist signal
        if(whitelistedRate == 1) {
          return 0;
        } else {
          return Math.min256(whitelistedRate, maximumRate);
        }
      } else {
        return Math.min256(baselineRate, maximumRate);
      }
  }

  function cutFor(
    address affiliate,
    uint256 productId,
    uint256 purchaseId,
    uint256 purchaseAmount
  )
    public view returns (uint256) {
      uint256 rate = rateFor(affiliate, productId, purchaseId, purchaseAmount);
      require(rate <= hardCodedMaximumRate);
      return (purchaseAmount.mul(rate)).div(10000);
  }

  /**
   * @dev depositFor
   */
  function depositFor(
    address affiliate,
    uint256 purchaseId
    ) public onlyStoreOrOwner whenNotPaused payable {
    require(msg.value > 0);
    require(affiliate != address(0));
    balances[affiliate] += msg.value;
    lastDeposit[affiliate] = now;
    AffiliateSale(affiliate, purchaseId, msg.value);
  }

  /**
   * @dev _performWithdraw
   */
  function _performWithdraw(address from, address to) private {
    require(balances[from] > 0);
    uint256 balanceValue = balances[from];
    balances[from] = 0;
    to.transfer(balanceValue);
    Withdraw(from, to, balanceValue);
  }

  /**
   * @dev withdraw
   */
  function withdraw() public whenNotPaused {
    _performWithdraw(msg.sender, msg.sender);
  }

  /**
   * @dev withdrawFrom
   * This function can be called even if the contract is paused
   */
  function withdrawFrom(address affiliate, address to) onlyStoreOrOwner public {
    require(now > lastDeposit[affiliate] + 30 days);
    _performWithdraw(affiliate, to);
  }

  /**
   * @dev whitelistAffiliate - white listed affiliates can receive a different
   *   rate than the general public (whitelisted accounts would generally get a
   *   better rate).
   * @param affiliate - the affiliate address to whitelist
   * @param rate - the rate, in basis-points (1/100th of a percent) to give this affiliate in each sale. NOTE: a rate of exactly 1 is the signal to blacklist this affiliate. That is, a rate of 1 will set the commission to 0.
   */
  function whitelistAffiliate(address affiliate, uint256 rate) onlyStoreOrOwner public {
    require(rate <= hardCodedMaximumRate);
    whitelistRates[affiliate] = rate;
    Whitelisted(affiliate, rate);
  }

  /**
   * @dev setBaselineRate
   */
  function setBaselineRate(uint256 newRate) onlyStoreOrOwner public {
    require(newRate <= hardCodedMaximumRate);
    baselineRate = newRate;
    BaselineRate(newRate);
  }

  /**
   * @dev setMaximumRate
   */
  // The maximum rate for any affiliate -- overrides individual rates
  function setMaximumRate(uint256 newRate) onlyStoreOrOwner public {
    require(newRate <= hardCodedMaximumRate);
    maximumRate = newRate;
    MaximumRate(newRate);
  }

}
