pragma solidity ^0.4.18;

import "./LicenseInventory.sol";
import "./ERC721.sol";

contract LicenseOwnership is LicenseInventory, ERC721 {

  /*** Events ***/

  /*** Constants ***/
  string public constant NAME = "Dottabot";
  string public constant SYMBOL = "Dottabot";

  function implementsERC721() public pure returns (bool) {
    return true;
  }

  function name() public pure returns (string) {
    return NAME;
  }

  function symbol() public pure returns (string) {
    return SYMBOL;
  }

  function totalSupply() public view returns (uint256 total) {
    return licenses.length;
  }

  function balanceOf(address _owner) public view returns (uint256 balance) {
    return ownershipTokenCount[_owner];
  }

  function ownerOf(uint256 _tokenId)
    public
    view
    returns (address owner)
  {
    owner = licenseIndexToOwner[_tokenId];
    require(owner != address(0));
  }

  function _owns(address _claimant, uint256 _tokenId) internal view returns (bool) {
    return licenseIndexToOwner[_tokenId] == _claimant;
  }

  function _approvedFor(address _claimant, uint256 _tokenId) internal view returns (bool) {
    return licenseIndexToApproved[_tokenId] == _claimant;
  }

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

  function _approve(address _from, address _approved, uint256 _tokenId) internal {
    licenseIndexToApproved[_tokenId] = _approved;
    Approval(_from, _approved, _tokenId);
  }

  function transfer(
    address _to,
    uint256 _tokenId
  )
    public
    whenNotPaused
  {
    require(_to != address(0));
    require(_owns(msg.sender, _tokenId));
    _transfer(msg.sender, _to, _tokenId);
  }

  function approve(
      address _to,
      uint256 _tokenId
  )
      public
      whenNotPaused
  {
    require(_owns(msg.sender, _tokenId));
    _approve(msg.sender, _to, _tokenId);
  }

  function transferFrom(
      address _from,
      address _to,
      uint256 _tokenId
  )
      public
      whenNotPaused
  {
      require(_approvedFor(msg.sender, _tokenId));
      require(_owns(_from, _tokenId));
      _transfer(_from, _to, _tokenId);
  }

  function tokensOfOwner(address _owner) public view returns(uint256[] ownerTokens) {
    uint256 tokenCount = balanceOf(_owner);
    if (tokenCount == 0) {
        // Return an empty array
      return new uint256[](0);
    } else {
      uint256[] memory result = new uint256[](tokenCount);
      uint256 total = totalSupply();
      uint256 resultIndex = 0;

      uint256 licenseId;
      for (licenseId = 0; licenseId <= total; licenseId++) {
        if (licenseIndexToOwner[licenseId] == _owner) {
          result[resultIndex] = licenseId;
          resultIndex++;
        }
      }
      return result;
    }
  }

  // TODO!
  function takeOwnership(uint256 _tokenId) {
    // TODO
  }

}
