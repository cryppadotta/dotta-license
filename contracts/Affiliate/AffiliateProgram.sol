pragma solidity ^0.4.19;

import '../math/SafeMath.sol';
import '../lifecycle/Pausable.sol';

/**

* Affiliate whitelisting
* Affilite base-rate - will go to any address, if they withdraw
* Track affiliate sales
* Track soldAt date -- because we can withdraw their funds after 30 days
* Set individual affiliate rates, whitelisting and blacklisting
* pause the program
* set the licensing

 */
contract AffiliateProgram is Pausable {
  using SafeMath for uint256;

  struct AffiliateSale {
    // The address of the affiliate
    address affiliate;
    // The store's ID of what was sold (e.g. a tokenId)
    uint256 purchaseId;
    // The time when this sale was made
    uint64 createdAt;
    // The amount owed this affiliate
    uint256 amount;
    // Indicates if this amount was withdrawn or not
    bool withdrawn;
  }

  // A list of all AffiliateSales
  AffiliateSale[] sales;

  // The baseline affiliate rate (in basis points) for non-whitelisted referrals
  uint256 private baselineRate;

  // The maximum rate for any affiliate -- overrides individual rates
  uint256 private maximumRate;

  // A mapping from whitelisted referrals to their individual rates
  mapping (address => uint256) private whitelistRates;

  // The address of the store selling products
  address private storeAddress;


  function AffiliateProgram(address _storeAddress) {
    storeAddress = _storeAddress;
    paused = true;
  }

  function isAffiliateProgram() public view returns (bool) {
    return true;
  }







}
