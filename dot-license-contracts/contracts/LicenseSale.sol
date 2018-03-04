pragma solidity ^0.4.19;

import "./LicenseOwnership.sol";
import "./Affiliate/AffiliateProgram.sol";

contract LicenseSale is LicenseOwnership {
  AffiliateProgram public affiliateProgram;

  /** internal **/
  function _performPurchase(
    uint256 _productId,
    uint256 _numCycles,
    address _assignee,
    uint256 _attributes,
    address _affiliate)
    internal returns (uint)
  {
    _purchaseOneUnitInStock(_productId);
    return _createLicense(_productId, _numCycles, _assignee, _attributes, _affiliate);
  }

  function _createLicense(
    uint256 _productId,
    uint256 _numCycles,
    address _assignee,
    uint256 _attributes,
    address _affiliate)
    internal
    returns (uint)
  {

    License memory _license = License({
      productId: _productId,
      attributes: _attributes,
      issuedTime: now, // solium-disable-line security/no-block-members
      expirationTime: now.add(intervalOf(_productId).mul(_numCycles)), // solium-disable-line security/no-block-members
      affiliate: _affiliate
    });

    uint256 newLicenseId = licenses.push(_license) - 1; // solium-disable-line zeppelin/no-arithmetic-operations
    Issued(
      _assignee,
      newLicenseId,
      _license.productId,
      _license.attributes,
      _license.issuedTime,
      _license.expirationTime,
      _license.affiliate);
    _mint(_assignee, newLicenseId);
    return newLicenseId;
  }

  function _handleAffiliate(
    address _affiliate,
    uint256 _productId,
    uint256 _licenseId,
    uint256 _purchaseAmount)
    internal
  {
    uint256 affiliateCut = affiliateProgram.cutFor(
      _affiliate,
      _productId,
      _licenseId,
      _purchaseAmount);
    if(affiliateCut > 0) {
      require(affiliateCut < _purchaseAmount);
      affiliateProgram.credit.value(affiliateCut)(_affiliate, _licenseId);
    }
  }

  /** executives **/
  function setAffiliateProgramAddress(address _address) public onlyCEO {
    AffiliateProgram candidateContract = AffiliateProgram(_address);
    require(candidateContract.isAffiliateProgram());
    affiliateProgram = candidateContract;
  }

  function createPromotionalPurchase(
    uint256 _productId,
    uint256 _numCycles,
    address _assignee,
    uint256 _attributes
    )
    public
    onlyCOO
    whenNotPaused
    returns (uint256)
  {
    return _performPurchase(_productId, _numCycles, _assignee, _attributes, address(0));
  }

  /** anyone **/

  /**
  * @notice Makes a purchase of a product.
  * @dev Requires that the value sent is exactly the price of the product
  * @param _productId - the product to purchase
  * @param _numCycles - the number of cycles being purchased. This number should be `1` for non-subscription products and the number of cycles for subscriptions.
  * @param _assignee - the address to assign the purchase to (doesn't have to be msg.sender)
  * @param _affiliate - the address to of the affiliate - use address(0) if none
  */
  function purchase(
    uint256 _productId,
    uint256 _numCycles,
    address _assignee,
    address _affiliate
    )
    public
    payable
    whenNotPaused
    returns (uint256)
  {
    require(_productId != 0);
    require(_numCycles != 0);
    require(_assignee != address(0));

    // Don't bother dealing with excess payments. Ensure the price paid is
    // accurate. No more, no less.
    require(msg.value == costForProductCycles(_productId, _numCycles));

    // Non-subscription products should send a _numCycle of 1 -- you can't buy a
    // multiple quantity of a non-subscription product with this function
    if(!isSubscriptionProduct(_productId)) {
      require(_numCycles == 1);
    }

    // TODO -- require a maximum number of cycles clock time?

    // this can, of course, be gamed by malicious miners. But it's adequate for our application
    // Feel free to add your own strategies for product attributes
    // solium-disable-next-line security/no-block-members, zeppelin/no-arithmetic-operations
    uint256 attributes = uint256(keccak256(block.blockhash(block.number-1)))^_productId^(uint256(_assignee));
    uint256 licenseId = _performPurchase(_productId, _numCycles, _assignee, attributes, _affiliate);

    if(
      priceOf(_productId) > 0 &&
      _affiliate != address(0) &&
      affiliateProgram != address(0) &&
      affiliateProgram.storeAddress() == address(this) &&
      !affiliateProgram.paused()
    ) {
      _handleAffiliate(
        _affiliate,
        _productId,
        licenseId,
        msg.value);
    }

    return licenseId;
  }

  function renew()
    public
    payable
    whenNotPaused
  {
    // TODO
  }

}
