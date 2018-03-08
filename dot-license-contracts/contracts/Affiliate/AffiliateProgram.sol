pragma solidity ^0.4.19;

import "../math/SafeMath.sol";
import "../math/Math.sol";
import "../lifecycle/Pausable.sol";

/**
 * @title AffiliateProrgam
 * @notice Affiliate program manages referral comissions on sales.
 *
 * There are two tiers of affiliates: whitelistd and non-whitelisted.
 * Non-whitelisted are paid the baseline rate. Whitelisted rates are individualized.
 *
 * This contract holds the Ether for the affiliate and it can be withdrawn by that affiliate.
 *
 * However, there is a deadline: The goal is that no money is sitting in the
 * contract unclaimed for longer than 30 days.
 *
 * After 30 days, the funds are forfitted and the owner may withdraw the funds
 * credited to that affiliate.
 *
 * Rates are encoded in basis points (1/100th of a percent). For example, 1050
 * means 10.5%.
 *
 * There is a hardcoded maximum affiliate rate of 50%. Also, there is a
 * configurable maximum rate that caps the rate given to any affiliate,
 * including whitelisted. The maximumRate has precedence over any whitelisted rate.
 *
 * Setting a maximumRate of 0 effectively disables new credits to all affiliates.
 *
 * The contract can be paused by the owner.
 *
 * If there have been no deposits for 30 days, the owner can choose to retire
 * the contract and withdraw all remaining funds. This is final and the contract
 * cannot be unpaused after this event.
 *
 * Our store is built to support upgradable AffiliatePrograms - this is
 * recommended.
 *
 * Also, your store must be designed to operate normally when the affiliate program
 * is paused or missing.
 *
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
  event Whitelisted(address affiliate, uint256 amount);
  event RateChanged(uint256 rate, uint256 amount);

  // @notice A mapping from affiliate address to their balance
  mapping (address => uint256) public balances;

  // @notice A mapping from affiliate address to the time of last deposit
  mapping (address => uint256) public lastDepositTimes;

  // @notice The last deposit globally
  uint256 public lastDepositTime;

  // @notice The maximum rate for any affiliate
  // @dev The hard-coded maximum affiliate rate (in basis points)
  // All rates are measured in basis points (1/100 of a percent)
  // Values 0-10,000 map to 0%-100%
  uint256 private constant hardCodedMaximumRate = 5000;

  // @notice The commission exiration time
  // @dev Affiliate commissions expire if they are unclaimed after this amount of time
  uint256 private constant commissionExpiryTime = 30 days;

  // @notice The baseline affiliate rate (in basis points) for non-whitelisted referrals
  uint256 public baselineRate = 0;

  // @notice A mapping from whitelisted referrals to their individual rates
  mapping (address => uint256) public whitelistRates;

  // @notice The maximum rate for any affiliate
  // @dev overrides individual rates. This can be used to clip the rate used in bulk, if necessary
  uint256 public maximumRate = 5000;

  // @notice The address of the store selling products
  address public storeAddress;

  // @notice The contract is retired
  // @dev If we decide to retire this program, this value will be set to true
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
   * @notice Exposes that this contract thinks it is an AffiliateProgram
   */
  function isAffiliateProgram() public pure returns (bool) {
    return true;
  }

  /**
   * @notice returns the commission rate for a sale
   *
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
   *  This implementation does not use the _productId, _pruchaseId,
   *  _purchaseAmount, but we include them here as part of the protocol, because
   *  they could be useful in more advanced affiliate programs.
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
   * @notice cutFor returns the affiliate cut for a sale
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
   * @notice credit an affiliate for a purchase
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
   * @notice withdraw
   * @dev withdraw the msg.sender's balance
   */
  function withdraw() public whenNotPaused {
    _performWithdraw(msg.sender, msg.sender);
  }

  /**
   * @notice withdraw from a specific account
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
   * @notice retire the contract (dangerous)
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
   * @notice whitelist an affiliate address
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
   * @notice set the rate for non-whitelisted affiliates
   * @dev setBaselineRate - sets the baseline rate for any affiliate that is not whitelisted
   * @param _newRate - the rate, in bp (1/100th of a percent) to give any non-whitelisted affiliate. Set to zero to "turn off"
   */
  function setBaselineRate(uint256 _newRate) onlyOwner public {
    require(_newRate <= hardCodedMaximumRate);
    baselineRate = _newRate;
    RateChanged(0, _newRate);
  }

  /**
   * @notice set the maximum rate for any affiliate
   * @dev setMaximumRate - Set the maximum rate for any affiliate, including whitelists. That is, this overrides individual rates.
   * @param _newRate - the rate, in bp (1/100th of a percent)
   */
  function setMaximumRate(uint256 _newRate) onlyOwner public {
    require(_newRate <= hardCodedMaximumRate);
    maximumRate = _newRate;
    RateChanged(1, _newRate);
  }

  /**
   * @notice unpause the contract
   * @dev called by the owner to unpause, returns to normal state. Will not
   * unpause if the contract is retired.
   */
  function unpause() onlyOwner whenPaused public {
    require(!retired);
    paused = false;
    Unpause();
  }

}
