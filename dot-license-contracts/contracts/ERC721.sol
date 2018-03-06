pragma solidity ^0.4.19;

/**
 * @title ERC721 interface
 * @dev see https://github.com/ethereum/eips/issues/721
 */

/* solium-disable zeppelin/missing-natspec-comments */
contract ERC721 {
  event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
  event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);

  function balanceOf(address _owner) public view returns (uint256 _balance);
  function ownerOf(uint256 _tokenId) public view returns (address _owner);
  function transfer(address _to, uint256 _tokenId) public;
  function transferFrom(address _from, address _to, uint256 _tokenId) public;
  function approveAll(address _to) public;
  /* solium-disable-next-line dotta/underscore-function-arguments */
  function supportsInterface(bytes4 interfaceID) external view returns (bool);
  function tokenMetadata(uint256 _tokenId) public view returns (string infoUrl);
}
