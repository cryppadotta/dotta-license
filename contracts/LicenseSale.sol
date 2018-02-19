pragma solidity ^0.4.18;

import "./LicenseOwnership.sol";

contract LicenseSale is LicenseOwnership {

  function purchase(
    uint256 _productId,
    address _assignee
    )
    public payable whenNotPaused
  {
    // Make sure the price paid is accurate. No more, no less
    // Note that this will pass if the product doesn't exist and the value sent is 0 (because the price will be zero)
    require(msg.value == priceOf(_productId));

    // this can, of course, be gamed by malicious miners. But it's adequate for our application
    uint256 attributes = uint256(keccak256(block.blockhash(block.number-1)))^_productId;
    _performPurchase(_productId, _assignee, attributes);
  }

  function createPromotionalPurchase(
    uint256 _productId,
    address _assignee,
    uint256 _attributes
    )
    public onlyCOO whenNotPaused
  {
    _performPurchase(_productId, _assignee, _attributes);
  }

  function _performPurchase(uint256 _productId, address _assignee, uint256 _attributes) internal {
    _purchaseOneUnitInStock(_productId);
    _createLicense(_productId, _assignee, _attributes);
  }

  function _createLicense(
      uint256 _product,
      address _owner,
      uint256 _attributes
    )
      internal
      returns (uint)
  {

    License memory _license = License({
      product: _product,
      attributes: _attributes,
      issuedTime: uint64(now)
    });

    uint256 newLicenseId = licenses.push(_license) - 1;

    Issued(_owner, newLicenseId, _license.product, _license.attributes, _license.issuedTime);

    _transfer(0, _owner, newLicenseId);

    return newLicenseId;
  }


}
