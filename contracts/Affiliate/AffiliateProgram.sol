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

  struct AffilateSale {
    // The address of the affiliate
    address affiliate;
    // The tokenId that was sold
    uint256 tokenId;
    // The time when this sale was made
    uint64 createdAt;
    // The amount owed this affiliate
    uint256 amount;
    // Indicates if this amount was withdrawn or not
    bool withdrawn;
  }

  uint256 baselineRate;

  mapping (address => uint256) private whitelistRates;





}
