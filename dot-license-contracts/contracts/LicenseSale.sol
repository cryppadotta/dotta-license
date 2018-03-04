pragma solidity ^0.4.19;

import "./LicenseOwnership.sol";
import "./Affiliate/AffiliateProgram.sol";

contract LicenseSale is LicenseOwnership {
  AffiliateProgram public affiliateProgram;

  /** internal **/
  function _performPurchase(
    uint256 _productId,
    address _assignee,
    uint256 _attributes)
    internal returns (uint)
  {
    _purchaseOneUnitInStock(_productId);
    return _createLicense(_productId, _assignee, _attributes);
  }

  function _createLicense(
    uint256 _productId,
    address _assignee,
    uint256 _attributes)
    internal
    returns (uint)
  {
    License memory _license = License({
      productId: _productId,
      attributes: _attributes,
      issuedTime: now // solium-disable-line security/no-block-members
    });

    uint256 newLicenseId = licenses.push(_license) - 1; // solium-disable-line zeppelin/no-arithmetic-operations
    Issued(
      _assignee,
      newLicenseId,
      _license.productId,
      _license.attributes,
      _license.issuedTime);
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
    address _assignee,
    uint256 _attributes
    )
    public
    onlyCOO
    whenNotPaused
    returns (uint256)
  {
    return _performPurchase(_productId, _assignee, _attributes);
  }

  /** anyone **/

  /**
   * @notice returns the total cost to renew a product for a number of cycles
   * @devdoc If a product is a subscription, the interval defines the period of time, in seconds,
   *  users can subscribe for. E.g. 1 month or 1 year. _numCycles is the number of these intervals
   *  we want to use in the calculation of the price.
   *
   *  We require that the end user send precisely the amount required (instead of dealing with excess refunds).
   *  This method is public so that clients can read the exact amount our contract expects to receive.
   *
   * @param _productId - the product we're calculating for
   * @param _numCycles - the number of cycles to calculate for
   */
  function costForProductCycles(uint256 _productId, uint256 _numCycles) public view returns (uint256) {
    return products[_productId].price.mul(_numCycles);
  }

  /**
  * @notice Purchase - makes a purchase of a product. Requires that the value sent is exactly the price of the product
  * @param _productId - the product to purchase
  * @param _assignee - the address to assign the purchase to (doesn't have to be msg.sender)
  * @param _affiliate - the address to of the affiliate - use address(0) if none
  */
  function purchase(
    uint256 _productId,
    address _assignee,
    address _affiliate
    )
    public
    payable
    whenNotPaused
    returns (uint256)
  {
    require(_productId != 0);
    require(_assignee != address(0));

    // Don't bother dealing with excess payments. Ensure the price paid is
    // accurate. No more, no less.
    require(msg.value == priceOf(_productId));

    // this can, of course, be gamed by malicious miners. But it's adequate for our application
    // Feel free to add your own strategies for product attributes
    // solium-disable-next-line security/no-block-members, zeppelin/no-arithmetic-operations
    uint256 attributes = uint256(keccak256(block.blockhash(block.number-1)))^_productId^(uint256(_assignee));
    uint256 licenseId = _performPurchase(_productId, _assignee, attributes);

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

}
