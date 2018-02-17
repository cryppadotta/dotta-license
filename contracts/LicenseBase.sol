pragma solidity ^0.4.18;

import "./LicenseAccessControl.sol";

contract LicenseBase is LicenseAccessControl {
  event Issued(address indexed owner, uint256 licenseId, uint256 product);

  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

  struct License {
    uint256 product;
  }

  /**
   * @dev All licenses in existence. The ID of each license is an index in this array.
   */
  License[] licenses;

  // @dev A mapping from license IDs to the address that owns them
  mapping (uint256 => address) public licenseIndexToOwner;

  // @dev A mapping from owners address to count of tokens that address owns
  mapping (address => uint256) ownershipTokenCount;

  // @dev A mapping from license IDs to an address that is approved to call transferFrom()
  mapping (uint256 => address) public licenseIndexToApproved;

  function _transfer(address _from, address _to, uint256 _tokenId) internal {
    ownershipTokenCount[_to]++;
    licenseIndexToOwner[_tokenId] = _to;

    // When creating new licenses _from is 0x0, but don't track ownership counts from that address
    if (_from != address(0)) {
        ownershipTokenCount[_from]--;
        // clear any previously approved ownership exchange
        delete licenseIndexToApproved[_tokenId];
    }
    Transfer(_from, _to, _tokenId);
  }


  function _createLicense(
      uint256 _product,
      address _owner
    )
      internal
      returns (uint)
  {

    License memory _license = License({
      product: _product
    });

    uint256 newLicenseId = licenses.push(_license) - 1;

    Issued(_owner, newLicenseId, _license.product);

    // transfer to new owner - todo

    return newLicenseId;
  }
}
