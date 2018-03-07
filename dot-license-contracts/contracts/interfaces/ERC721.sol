pragma solidity ^0.4.19;

/**
 * @title ERC721 interface
 * @dev see https://github.com/ethereum/eips/issues/721
 */

/* solium-disable zeppelin/missing-natspec-comments */
contract ERC721 {
  event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
  event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  function balanceOf(address _owner) public view returns (uint256 _balance);
  function ownerOf(uint256 _tokenId) public view returns (address _owner);
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) public payable;
  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;
  function transfer(address _to, uint256 _tokenId) external;
  function transferFrom(address _from, address _to, uint256 _tokenId) public;
  function approve(address _to, uint256 _tokenId) external;
  function setApprovalForAll(address _to, bool _approved) external;
  function getApproved(uint256 _tokenId) public view returns (address);
  function isApprovedForAll(address _owner, address _operator) public view returns (bool);
}
