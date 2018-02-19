pragma solidity ^0.4.18;

import "./LicenseBase.sol";
import "./math/SafeMath.sol";

contract LicenseInventory is LicenseBase {
  using SafeMath for uint256;

  event ProductCreated(uint256 productId, uint256 price, uint256 available, uint256 supply);
  event ProductInventoryAdjusted(uint256 product, uint256 quantity);
  event ProductPriceChanged(uint256 product, uint256 price);

  struct Product {
    uint256 id;
    uint256 price;
    uint256 availableInventory;
    uint256 supply;
  }

  // @dev All products in existence
  uint256[] public allProductIds;

  // @dev A mapping from product ids to Products
  mapping (uint256 => Product) public products;

  /*** internal ***/
  function _productExists(uint256 _productId) internal view returns (bool) {
    return products[_productId].id != 0;
  }

  function _productDoesNotExist(uint256 _productId) internal view returns (bool) {
    return products[_productId].id == 0;
  }

  function _createProduct(
      uint256 _productId,
      uint256 _initialPrice,
      uint256 _initialInventoryQuantity,
      uint256 _supply
    )
    internal
  {
    require(_productDoesNotExist(_productId));
    require(_initialInventoryQuantity <= _supply);

    Product memory _product = Product({
      id: _productId,
      price: _initialPrice,
      availableInventory: _initialInventoryQuantity,
      supply: _supply
    });

    products[_productId] = _product;
    allProductIds.push(_productId);

    ProductCreated(_product.id, _product.price, _product.availableInventory, _product.supply);
  }

  function _incrementInventory(uint256 _productId, uint256 _inventoryAdjustment) internal
  {
    require(_productExists(_productId));

    uint256 newInventoryLevel = products[_productId].availableInventory.add(_inventoryAdjustment);

    // A supply of "0" means "unlimited". Otherwise we need to ensure that we're not over-creating this product
    if(products[_productId].supply > 0) {
      require(newInventoryLevel <= products[_productId].supply);
    }

    products[_productId].availableInventory = newInventoryLevel;
  }

  function _decrementInventory(uint256 _productId, uint256 _inventoryAdjustment) internal
  {
    require(_productExists(_productId));
    uint256 newInventoryLevel = products[_productId].availableInventory.sub(_inventoryAdjustment);
    // unnecessary because we're using SafeMath and an unsigned int
    // require(newInventoryLevel >= 0);
    products[_productId].availableInventory = newInventoryLevel;
  }

  function _setPrice(uint256 _productId, uint256 _price) internal
  {
    require(_productExists(_productId));
    products[_productId].price = _price;
  }

  /*** public ***/

  /** executives-only **/
  function createProduct(
      uint256 _productId,
      uint256 _initialPrice,
      uint256 _initialInventoryQuantity,
      uint256 _supply
    ) public onlyCEOOrCOO {
      _createProduct(_productId, _initialPrice, _initialInventoryQuantity, _supply);
  }

  function incrementInventory(uint256 _productId, uint256 _inventoryAdjustment) public onlyCLevel
  {
    _incrementInventory(_productId, _inventoryAdjustment);
    ProductInventoryAdjusted(_productId, availableInventoryOf(_productId));
  }

  function decrementInventory(uint256 _productId, uint256 _inventoryAdjustment) public onlyCLevel
  {
    _decrementInventory(_productId, _inventoryAdjustment);
    ProductInventoryAdjusted(_productId, availableInventoryOf(_productId));
  }

  function setPrice(uint256 _productId, uint256 _price) public onlyCLevel
  {
    _setPrice(_productId, _price);
    ProductPriceChanged(_productId, _price);
  }

  /** anyone **/

  function priceOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].price;
  }

  function availableInventoryOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].availableInventory;
  }

  function totalSupplyOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].supply;
  }

  function productInfo(uint256 _productId) public view returns (uint256, uint256, uint256) {
    return (priceOf(_productId), availableInventoryOf(_productId), totalSupplyOf(_productId));
  }
}
