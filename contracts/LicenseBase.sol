pragma solidity ^0.4.19;

import "./LicenseAccessControl.sol";

/**
 * @title LicenseBase
 * @dev This contract defines the License data structure and how to read from it
 */
contract LicenseBase is LicenseAccessControl {
  /**
   * @dev Issued is emitted when a new license is issued
   */
  event Issued(
    address indexed owner,
    uint256 licenseId,
    uint256 productId,
    uint256 attributes,
    uint256 issuedTime
  );

  struct License {
    uint256 productId;
    uint256 attributes;
    uint256 issuedTime;
  }

  /**
   * @dev All licenses in existence. The ID of each license is an index in this array.
   */
  License[] licenses;

  /** anyone **/
  function licenseProductId(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].productId;
  }

  function licenseAttributes(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].attributes;
  }

  function licenseIssuedTime(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].issuedTime;
  }

  function licenseInfo(uint256 _licenseId)
    public view returns (uint256, uint256, uint256)
  {
    return (
      licenseProductId(_licenseId),
      licenseAttributes(_licenseId),
      licenseIssuedTime(_licenseId)
    );
  }
}
