pragma solidity ^0.4.19;

import "./LicenseSale.sol";

/**
 * @title LicenseCore is the entry point of the contract
 * @dev LicenseCore is the entry point and it controls the ability to set a new
 * contract address, in the case where an upgrade is required
 */
contract LicenseCore is LicenseSale {
  address public newContractAddress;

  function LicenseCore() public {
    paused = true;

    ceoAddress = msg.sender;
    cooAddress = msg.sender;
    cfoAddress = msg.sender;
    withdrawalAddress = msg.sender;
  }

  function setNewAddress(address _v2Address) public onlyCEO whenPaused {
    newContractAddress = _v2Address;
    ContractUpgrade(_v2Address);
  }

  function() external {
    assert(false);
  }

  function unpause() public onlyCEO whenPaused {
    require(newContractAddress == address(0));
    super.unpause();
  }
}
