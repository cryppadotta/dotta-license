pragma solidity ^0.4.19;

import "./LicenseAccessControl.sol";

/**
 * @title LicenseBase
 * @notice This contract defines the License data structure and how to read from it
 */
contract LicenseBase is LicenseAccessControl {
  /**
   * @notice Issued is emitted when a new license is issued
   */
  event Issued(
    address indexed owner,
    uint256 licenseId,
    uint256 productId,
    uint256 attributes,
    uint256 issuedTime,
    uint256 expirationTime,
    address affiliate
  );

  struct License {
    uint256 productId;
    uint256 attributes;
    uint256 issuedTime;
    uint256 expirationTime;
    address affiliate;
  }

  /**
   * @notice All licenses in existence.
   * @dev The ID of each license is an index in this array.
   */
  License[] licenses;

  /** anyone **/

  /**
   * @notice Get a license's productId
   * @param _licenseId the license id
   */
  function licenseProductId(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].productId;
  }

  /**
   * @notice Get a license's attributes
   * @param _licenseId the license id
   */
  function licenseAttributes(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].attributes;
  }

  /**
   * @notice Get a license's issueTime
   * @param _licenseId the license id
   */
  function licenseIssuedTime(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].issuedTime;
  }

  /**
   * @notice Get a license's issueTime
   * @param _licenseId the license id
   */
  function licenseExpirationTime(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].expirationTime;
  }

  /**
   * @notice Get a license's issueTime
   * @param _licenseId the license id
   */
  function licenseExpirationTime(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].expirationTime;
  }

  /**
   * @notice Get a the affiliate credited for the sale of this license
   * @param _licenseId the license id
   */
  function licenseAffiliate(uint256 _licenseId) public view returns (uint256) {
    return licenses[_licenseId].affiliate;
  }

  /**
   * @notice Get a license's info
   * @param _licenseId the license id
   */
  function licenseInfo(uint256 _licenseId)
    public view returns (uint256, uint256, uint256, uint256, uint256)
  {
    return (
      licenseProductId(_licenseId),
      licenseAttributes(_licenseId),
      licenseIssuedTime(_licenseId),
      licenseExpirationTime(_licenseId),
      licenseAffiliate(_licenseId)
    );
  }
}
