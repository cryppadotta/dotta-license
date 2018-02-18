pragma solidity ^0.4.18;

import "./LicenseBase.sol";
import "./math/SafeMath.sol";

contract LicenseInventory is LicenseBase {
  using SafeMath for uint256;

  event ProductCreated(uint256 product, uint256 price, uint256 quantity);
  event ProductInventoryChanged(uint256 product, uint256 quantity);
  event ProductPriceChanged(uint256 product, uint256 price);

  struct Product {
    uint256 productIdentifier;
  }

  // @dev All products in existence
  Product[] products;

  // @dev A mapping from license IDs to the address that owns them
  mapping (uint256 => uint256) public productInventories;

  // @dev A mapping from license IDs to the price
  mapping (uint256 => uint256) public productPrices;

  function _createProduct(
      uint256 _productId,
      uint256 _initialPrice,
      uint256 _initialInventoryQuantity
    )
    internal
  {

    // TODO -- maybe we just keep an array of uint256 and forget about the struct. Does that save us anything? The other solution would go full struct and put quantities and pricing in the struct.
    Product memory _product = Product({
      productIdentifier: _productId
    });

    products.push(_product);

    productInventories[_productId] = _initialInventoryQuantity;
    productPrices[_productId] = _initialPrice;

    ProductCreated(_product.productIdentifier, _initialPrice, _initialInventoryQuantity);
  }

  function createProduct(
      uint256 _productId,
      uint256 _initialPrice,
      uint256 _initialInventoryQuantity
    ) public onlyCLevel {
      // Hmm, consider collapsing into one
      _createProduct(_productId, _initialPrice, _initialInventoryQuantity);
  }


  function _incrementInventory(uint256 _productId, uint256 _inventoryAdjustment) internal
  {
    productInventories[_productId].add(_inventoryAdjustment);
  }

  function _decrementInventory(uint256 _productId, uint256 _inventoryAdjustment) internal
  {
    productInventories[_productId].sub(_inventoryAdjustment);
  }

  function setInventory(uint256 _productId, uint256 _inventoryQuantity) public onlyCLevel
  {
    // TODO require productId already exists
    productInventories[_productId] = _inventoryQuantity;
    ProductInventoryChanged(_productId, _inventoryQuantity);
  }

  function incrementInventory(uint256 _productId, uint256 _inventoryAdjustment) public onlyCLevel
  {
    _incrementInventory(_productId, _inventoryAdjustment);
    ProductInventoryChanged(_productId, productInventories[_productId]);
  }

  function decrementInventory(uint256 _productId, uint256 _inventoryAdjustment) public onlyCLevel
  {
    _decrementInventory(_productId, _inventoryAdjustment);
    ProductInventoryChanged(_productId, productInventories[_productId]);
  }

  function setPrice(uint256 _productId, uint256 _price) public onlyCLevel
  {
    productPrices[_productId] = _price;
    ProductPriceChanged(_productId, _price);
  }

  function inventoryOf(uint256 _productId) public view returns (uint256) {
    return productInventories[_productId];
  }

  function priceOf(uint256 _productId) public view returns (uint256) {
    return productPrices[_productId];
  }

}
