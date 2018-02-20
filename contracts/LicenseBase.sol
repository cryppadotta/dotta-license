pragma solidity ^0.4.18;

import "./LicenseAccessControl.sol";

contract LicenseBase is LicenseAccessControl {
  event Issued(
    address indexed owner,
    uint256 licenseId,
    uint256 productId,
    uint256 attributes,
    uint64 issuedTime
  );

  // TODO remove for production
  event Debug(uint256 value);

  struct License {
    uint256 productId;
    uint256 attributes;
    uint64 issuedTime;
  }

  /**
   * @dev All licenses in existence. The ID of each license is an index in this array.
   */
  License[] licenses;
}
