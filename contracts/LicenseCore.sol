pragma solidity ^0.4.18;

import "./LicenseSale.sol";

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

  function() external payable {
    assert(false);
  }

  function unpause() public onlyCEO whenPaused {
    require(newContractAddress == address(0));
    super.unpause();
  }
}
