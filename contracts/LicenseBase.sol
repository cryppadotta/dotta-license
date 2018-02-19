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

  event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

  struct License {
    uint256 productId;
    uint256 attributes;
    uint64 issuedTime;
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
}
