pragma solidity ^0.4.18;

import "./LicenseCore.sol";

contract LicenseCoreTest is LicenseCore {

  function LicenseTest() public {
  }

  function fund() public payable returns (bool) {
    return true;
  }

  function timeNow() public constant returns (uint256) {
    return now;
  }
}
