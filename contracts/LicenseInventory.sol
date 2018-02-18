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

    Product memory _product = Product({
      productIdentifier: _productId
    });

    products.push(_product);

    productInventories[_productId] = _initialInventoryQuantity;
    productPrices[_productId] = _initialPrice;

    ProductCreated(_product.productIdentifier, _initialPrice, _initialInventoryQuantity);
  }

  function _setInventory(uint256 _productId, uint256 _inventoryQuantity)
    internal
  {
    // TODO require productId already exists
    productInventories[_productId] = _inventoryQuantity;
    ProductInventoryChanged(_productId, _inventoryQuantity);
  }

  function _incrementInventory(uint256 _productId, uint256 _inventoryAdjustment)
    internal
  {
    productInventories[_productId].add(_inventoryAdjustment);
    ProductInventoryChanged(_productId, productInventories[_productId]);
  }

  function _decrementInventory(uint256 _productId, uint256 _inventoryAdjustment)
    internal
  {
    productInventories[_productId].sub(_inventoryAdjustment);
    ProductInventoryChanged(_productId, productInventories[_productId]);
  }

  function _setPrice(uint256 _productId, uint256 _price)
    internal
  {
    productPrices[_productId] = _price;
    ProductPriceChanged(_productId, _price);
  }

}
