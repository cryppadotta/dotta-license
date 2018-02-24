pragma solidity ^0.4.19;

/**
 * @title LicenseAccessControl
 * @notice This contract defines organizational roles and permissions.
 */
contract LicenseAccessControl {
  /**
   * @notice ContractUpgrade is the event that will be emitted if we set a new contract address
   */
  event ContractUpgrade(address newContract);
  event Paused();
  event Unpaused();

  address public ceoAddress;
  address public cfoAddress;
  address public cooAddress;
  address public withdrawalAddress;

  bool public paused = false;

  /**
   * @dev Modifier to make a function only callable by the CEO
   */
  modifier onlyCEO() {
    require(msg.sender == ceoAddress);
    _;
  }

  /**
   * @dev Modifier to make a function only callable by the CFO
   */
  modifier onlyCFO() {
    require(msg.sender == cfoAddress);
    _;
  }

  /**
   * @dev Modifier to make a function only callable by the COO
   */
  modifier onlyCOO() {
    require(msg.sender == cooAddress);
    _;
  }

  /**
   * @dev Modifier to make a function only callable by C-level execs
   */
  modifier onlyCLevel() {
    require(
      msg.sender == cooAddress ||
      msg.sender == ceoAddress ||
      msg.sender == cfoAddress
    );
    _;
  }

  /**
   * @dev Modifier to make a function only callable by CEO or CFO
   */
  modifier onlyCEOOrCFO() {
    require(
      msg.sender == cfoAddress ||
      msg.sender == ceoAddress
    );
    _;
  }

  /**
   * @dev Modifier to make a function only callable by CEO or COO
   */
  modifier onlyCEOOrCOO() {
    require(
      msg.sender == cooAddress ||
      msg.sender == ceoAddress
    );
    _;
  }

  /**
   * @notice Sets a new CEO
   * @param _newCEO - the address of the new CEO
   */
  function setCEO(address _newCEO) public onlyCEO {
    require(_newCEO != address(0));
    ceoAddress = _newCEO;
  }

  /**
   * @notice Sets a new CFO
   * @param _newCFO - the address of the new CFO
   */
  function setCFO(address _newCFO) public onlyCEO {
    require(_newCFO != address(0));
    cfoAddress = _newCFO;
  }

  /**
   * @notice Sets a new COO
   * @param _newCOO - the address of the new COO
   */
  function setCOO(address _newCOO) public onlyCEO {
    require(_newCOO != address(0));
    cooAddress = _newCOO;
  }

  /**
   * @notice Sets a new withdrawalAddress
   * @param _newWithdrawalAddress - the address where we'll send the funds
   */
  function setWithdrawalAddress(address _newWithdrawalAddress) public onlyCEO {
    require(_newWithdrawalAddress != address(0));
    withdrawalAddress = _newWithdrawalAddress;
  }

  /**
   * @notice Withdraw the balance to the withdrawalAddress
   * @dev We set a withdrawal address seperate from the CFO because this allows us to withdraw to a cold wallet.
   */
  function withdrawBalance() external onlyCEOOrCFO {
    require(withdrawalAddress != address(0));
    withdrawalAddress.transfer(this.balance);
  }

  /** Pausable functionality adapted from OpenZeppelin **/

  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!paused);
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);
    _;
  }

  /**
   * @notice called by any C-level to pause, triggers stopped state
   */
  function pause() onlyCLevel whenNotPaused public {
    paused = true;
    Paused();
  }

  /**
   * @notice called by the CEO to unpause, returns to normal state
   */
  function unpause() onlyCEO whenPaused public {
    paused = false;
    Unpaused();
  }
}
