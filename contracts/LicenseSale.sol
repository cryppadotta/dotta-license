pragma solidity ^0.4.18;

import "./LicenseOwnership.sol";

contract LicenseSale is LicenseOwnership {

  function purchase(uint256 _productId, address _assignee) public payable whenNotPaused {
    // Make sure there is inventory available for this product
    require(inventoryOf(_productId) > 0);

    // Make sure the price paid is accurate. No more, no less
    require(msg.value == priceOf(_productId));

    uint256 attributes = 0; // TODO

    _decrementInventory(_productId, 1);
    _createLicense(_productId, attributes, _assignee);
  }

  function createPromotionalPurchase() public onlyCLevel {
    // TODO
  }

  function _createLicense(
      uint256 _product,
      uint256 _attributes,
      address _owner
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
