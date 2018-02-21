pragma solidity ^0.4.19;

import "./LicenseOwnership.sol";
import "./Affiliate/AffiliateProgram.sol";

contract LicenseSale is LicenseOwnership {
  AffiliateProgram public affiliateProgram;

  function setAffiliateProgramAddress(address _address) public onlyCEO {
    AffiliateProgram candidateContract = AffiliateProgram(_address);
    require(candidateContract.isAffiliateProgram());
    affiliateProgram = candidateContract;
  }

  function purchase(
    uint256 _productId,
    address _assignee,
    address _affiliate
    )
    public payable whenNotPaused
    returns (uint)
  {
    // Make sure the price paid is accurate. No more, no less
    // Note that this will pass if the product doesn't exist and the value sent is 0 (because the price will be zero)
    require(msg.value == priceOf(_productId));

    // this can, of course, be gamed by malicious miners. But it's adequate for our application
    // TODO -- if two purchases for the same product are in the same block they will have
    // the same attributes -- we need to individualize it
    uint256 attributes = uint256(keccak256(block.blockhash(block.number-1)))^_productId^(uint256(_assignee));
    uint256 licenseId = _performPurchase(_productId, _assignee, attributes);

    if(
      priceOf(_productId) > 0 &&
      _affiliate != address(0) &&
      affiliateProgram != address(0) &&
      !affiliateProgram.paused()
    ) {
      _handleAffiliate(_affiliate, _productId, licenseId, msg.value);
    }

    return licenseId;
  }

  function createPromotionalPurchase(
    uint256 _productId,
    address _assignee,
    uint256 _attributes
    )
    public onlyCOO whenNotPaused
    returns (uint)
  {
    return _performPurchase(_productId, _assignee, _attributes);
  }

  function _performPurchase(uint256 _productId, address _assignee, uint256 _attributes) internal returns (uint) {
    _purchaseOneUnitInStock(_productId);
    return _createLicense(_productId, _assignee, _attributes);
  }

  function _createLicense(
      uint256 _productId,
      address _assignee,
      uint256 _attributes
    )
      internal
      returns (uint)
  {
    License memory _license = License({
      productId: _productId,
      attributes: _attributes,
      issuedTime: now
    });

    uint256 newLicenseId = licenses.push(_license) - 1;
    Issued(_assignee, newLicenseId, _license.productId, _license.attributes, _license.issuedTime);
    _mint(_assignee, newLicenseId);
    return newLicenseId;
  }

  function _handleAffiliate(
    address _affiliate,
    uint256 _productId,
    uint256 _licenseId,
    uint256 _purchaseAmount
  ) {
    uint256 affiliateCut = affiliateProgram.cutFor(_affiliate, _productId, _licenseId, _purchaseAmount);
    if(affiliateCut > 0) {
      require(affiliateCut < _purchaseAmount);
      affiliateProgram.credit(_affiliate, _licenseId).value(affiliateCut);
    }
  }

}
