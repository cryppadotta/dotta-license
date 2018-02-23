pragma solidity ^0.4.19;

import "../math/SafeMath.sol";
import "../math/Math.sol";
import "../lifecycle/Pausable.sol";

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

  event AffiliateCredit(
    // The address of the affiliate
    address affiliate,
    // The store's ID of what was sold (e.g. a tokenId)
    uint256 productId,
    // The amount owed this affiliate in this sale
    uint256 amount
  );

  event Withdraw(address affiliate, address to, uint256 amount);
  event Whitelisted(address affiliate, uint256 rate);
  event RateChanged(uint256 rate, uint256 amount);

  // A mapping from affiliate address to their balance
  mapping (address => uint256) public balances;

  // A mapping from affiliate address to the time of last deposit
  mapping (address => uint256) public lastDepositTimes;

  // The last deposit globally
  uint256 public lastDepositTime;

  // The hard-coded maximum affiliate rate (in basis points)
  // All rates are measured in basis points (1/100 of a percent)
  // Values 0-10,000 map to 0%-100%
  uint256 private constant hardCodedMaximumRate = 5000;

  // Affiliate commissions expire if they are unclaimed after this amount of time
  uint256 private constant commissionExpiryTime = 30 days;

  // The baseline affiliate rate (in basis points) for non-whitelisted referrals
  uint256 public baselineRate = 0;

  // A mapping from whitelisted referrals to their individual rates
  mapping (address => uint256) public whitelistRates;

  // The maximum rate for any affiliate -- overrides individual rates
  // This can be used to clip the rate used in bulk, if necessary
  uint256 public maximumRate = 5000;

  // The address of the store selling products
  address public storeAddress;

  // If we decide to retire this program, this value will be set to true
  // and then the contract cannot be unpaused
  bool public retired = false;


  /**
   * @dev Modifier to make a function only callable by the store or the owner
   */
  modifier onlyStoreOrOwner() {
    require(
      msg.sender == storeAddress ||
      msg.sender == owner);
    _;
  }

  /**
   * @dev AffiliateProgram constructor - keeps the address of it's parent store
   * and pauses the contract
   */
  function AffiliateProgram(address _storeAddress) public {
    require(_storeAddress != address(0));
    storeAddress = _storeAddress;
    paused = true;
  }

  /**
   * @dev Exposes that this contract thinks it is an AffiliateProgram
   */
  function isAffiliateProgram() public pure returns (bool) {
    return true;
  }

  /**
   * @dev rateFor returns the rate which should be used to calculate the comission
   *  for this affiliate/sale combination, in basis points (1/100th of a percent).
   *
   *  We may want to completely blacklist a particular address (e.g. a known bad actor affilite).
   *  To that end, if the whitelistRate is exactly 1bp, we use that as a signal for blacklisting
   *  and return a rate of zero. The upside is that we can completely turn off
   *  sending transactions to a particular address when this is needed. The
   *  downside is that you can't issued 1/100th of a percent commission.
   *  However, since this is such a small amount its an acceptable tradeoff.
   *
   * @param _affiliate - the address of the affiliate to check for
   */
  function rateFor(
    address _affiliate,
    uint256 /*_productId*/,
    uint256 /*_purchaseId*/,
    uint256 /*_purchaseAmount*/)
    public
    view
    returns (uint256)
  {
    uint256 whitelistedRate = whitelistRates[_affiliate];
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

  /**
   * @dev cutFor returns the cut (amount in wei) to give in comission to the affiliate
   *
   * @param _affiliate - the address of the affiliate to check for
   * @param _productId - the productId in the sale
   * @param _purchaseId - the purchaseId in the sale
   * @param _purchaseAmount - the purchaseAmount
   */
  function cutFor(
    address _affiliate,
    uint256 _productId,
    uint256 _purchaseId,
    uint256 _purchaseAmount)
    public
    view
    returns (uint256)
  {
    uint256 rate = rateFor(
      _affiliate,
      _productId,
      _purchaseId,
      _purchaseAmount);
    require(rate <= hardCodedMaximumRate);
    return (_purchaseAmount.mul(rate)).div(10000);
  }

  /**
   * @dev credit accepts eth and credits the affiliate's balance for the amount
   *
   * @param _affiliate - the address of the affiliate to credit
   * @param _purchaseId - the purchaseId of the sale
   */
  function credit(
    address _affiliate,
    uint256 _purchaseId)
    public
    onlyStoreOrOwner
    whenNotPaused
    payable
  {
    require(msg.value > 0);
    require(_affiliate != address(0));
    balances[_affiliate] += msg.value;
    lastDepositTimes[_affiliate] = now; // solium-disable-line security/no-block-members
    lastDepositTime = now; // solium-disable-line security/no-block-members
    AffiliateCredit(_affiliate, _purchaseId, msg.value);
  }

  /**
   * @dev _performWithdraw performs a withdrawal from address _from and
   * transfers it to _to. This can be different because we allow the owner
   * to withdraw unclaimed funds after a period of time.
   *
   * @param _from - the address to subtract balance from
   * @param _to - the address to transfer ETH to
   */
  function _performWithdraw(address _from, address _to) private {
    require(balances[_from] > 0);
    uint256 balanceValue = balances[_from];
    balances[_from] = 0;
    _to.transfer(balanceValue);
    Withdraw(_from, _to, balanceValue);
  }

  /**
   * @dev withdraw the msg.sender's balance
   */
  function withdraw() public whenNotPaused {
    _performWithdraw(msg.sender, msg.sender);
  }

  /**
   * @dev withdrawFrom allows the owner to withdraw an affiliate's unclaimed
   * ETH, after the alotted time.
   *
   * This function can be called even if the contract is paused
   *
   * @param _affiliate - the address of the affiliate
   * @param _to - the address to send ETH to
   */
  function withdrawFrom(address _affiliate, address _to) onlyOwner public {
    // solium-disable-next-line security/no-block-members
    require(now > lastDepositTimes[_affiliate].add(commissionExpiryTime));
    _performWithdraw(_affiliate, _to);
  }

  /**
   * @dev retire - withdraws the entire balance and marks the contract as retired, which
   * prevents unpausing.
   *
   * If no new comissions have been deposited for the alotted time,
   * then the owner may pause the program and retire this contract.
   * This may only be performed once as the contract cannot be unpaused.
   *
   * We do this as an alternative to selfdestruct, because certain operations
   * can still be performed after the contract has been selfdestructed, such as
   * the owner withdrawing ETH accidentally sent here.
   */
  function retire(address _to) onlyOwner whenPaused public {
    // solium-disable-next-line security/no-block-members
    require(now > lastDepositTime.add(commissionExpiryTime));
    _to.transfer(this.balance);
    retired = true;
  }

  /**
   * @dev whitelist - white listed affiliates can receive a different
   *   rate than the general public (whitelisted accounts would generally get a
   *   better rate).
   * @param _affiliate - the affiliate address to whitelist
   * @param _rate - the rate, in basis-points (1/100th of a percent) to give this affiliate in each sale. NOTE: a rate of exactly 1 is the signal to blacklist this affiliate. That is, a rate of 1 will set the commission to 0.
   */
  function whitelist(address _affiliate, uint256 _rate) onlyOwner public {
    require(_rate <= hardCodedMaximumRate);
    whitelistRates[_affiliate] = _rate;
    Whitelisted(_affiliate, _rate);
  }

  /**
   * @dev setBaselineRate - sets the baseline rate for any affiliate that is not whitelisted
   * @param _newRate - the rate, in bp (1/100th of a percent) to give any non-whitelisted affiliate. Set to zero to "turn off"
   */
  function setBaselineRate(uint256 _newRate) onlyOwner public {
    require(_newRate <= hardCodedMaximumRate);
    baselineRate = _newRate;
    RateChanged(0, _newRate);
  }

  /**
   * @dev setMaximumRate - Set the maximum rate for any affiliate, including whitelists. That is, this overrides individual rates.
   * @param _newRate - the rate, in bp (1/100th of a percent)
   */
  function setMaximumRate(uint256 _newRate) onlyOwner public {
    require(_newRate <= hardCodedMaximumRate);
    maximumRate = _newRate;
    RateChanged(1, _newRate);
  }

  /**
   * @dev called by the owner to unpause, returns to normal state. Will not
   * unpause if the contract is retired.
   */
  function unpause() onlyOwner whenPaused public {
    require(!retired);
    paused = false;
    Unpause();
  }

}
