pragma solidity ^0.4.19;

import "./LicenseBase.sol";
import "./math/SafeMath.sol";

/**
 * @title LicenseInventory
 * @dev LicenseInventory controls the products and inventory for those products
 **/
contract LicenseInventory is LicenseBase {
  using SafeMath for uint256;

  event ProductCreated(
    uint256 indexed productId,
    uint256 price,
    uint256 available,
    uint256 supply
  );
  event ProductInventoryAdjusted(uint256 indexed productId, uint256 available);
  event ProductPriceChanged(uint256 indexed productId, uint256 price);

  struct Product {
    uint256 id;
    uint256 price;
    uint256 available;
    uint256 supply;
    uint256 sold;
  }

  // @dev All products in existence
  uint256[] public allProductIds;

  // @dev A mapping from product ids to Products
  mapping (uint256 => Product) public products;

  /*** internal ***/

  /**
   * @dev _productExists checks to see if a product exists
   */
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
    uint256 _supply)
    internal
  {
    require(_productDoesNotExist(_productId));
    require(_initialInventoryQuantity <= _supply);

    Product memory _product = Product({
      id: _productId,
      price: _initialPrice,
      available: _initialInventoryQuantity,
      supply: _supply,
      sold: 0
    });

    products[_productId] = _product;
    allProductIds.push(_productId);

    ProductCreated(
      _product.id,
      _product.price,
      _product.available,
      _product.supply);
  }

  function _incrementInventory(
    uint256 _productId,
    uint256 _inventoryAdjustment)
    internal
  {
    require(_productExists(_productId));
    uint256 newInventoryLevel = products[_productId].available.add(_inventoryAdjustment);

    // A supply of "0" means "unlimited". Otherwise we need to ensure that we're not over-creating this product
    if(products[_productId].supply > 0) {
      // you have to take already sold into account
      require(products[_productId].sold.add(newInventoryLevel) <= products[_productId].supply);
    }

    products[_productId].available = newInventoryLevel;
  }

  function _decrementInventory(
    uint256 _productId,
    uint256 _inventoryAdjustment)
    internal
  {
    require(_productExists(_productId));
    uint256 newInventoryLevel = products[_productId].available.sub(_inventoryAdjustment);
    // unnecessary because we're using SafeMath and an unsigned int
    // require(newInventoryLevel >= 0);
    products[_productId].available = newInventoryLevel;
  }

  function _clearInventory(uint256 _productId) internal
  {
    require(_productExists(_productId));
    products[_productId].available = 0;
  }

  function _setPrice(uint256 _productId, uint256 _price) internal
  {
    require(_productExists(_productId));
    products[_productId].price = _price;
  }

  function _purchaseOneUnitInStock(uint256 _productId) internal {
    require(_productExists(_productId));
    require(availableInventoryOf(_productId) > 0);

    // lower inventory
    _decrementInventory(_productId, 1);

    // record that one was sold
    products[_productId].sold = products[_productId].sold.add(1);
  }

  /*** public ***/

  /** executives-only **/

  /**
   * @dev createProduct creates a new product in the system
   * @param _productId - the id of the product to use (cannot be changed)
   * @param _initialPrice - the starting price (price can be changed)
   * @param _initialInventoryQuantity - the initial inventory (inventory can be changed)
   * @param _supply - the total supply - use `0` for "unlimited" (cannot be changed)
   */
  function createProduct(
    uint256 _productId,
    uint256 _initialPrice,
    uint256 _initialInventoryQuantity,
    uint256 _supply)
    public
    onlyCEOOrCOO
  {
    _createProduct(
      _productId,
      _initialPrice,
      _initialInventoryQuantity,
      _supply);
  }

  /**
   * @dev incrementInventory - increments the inventory of a product
   * @param _productId - the product id
   * @param _inventoryAdjustment - the amount to increment
   */
  function incrementInventory(
    uint256 _productId,
    uint256 _inventoryAdjustment)
    public
    onlyCLevel
  {
    _incrementInventory(_productId, _inventoryAdjustment);
    ProductInventoryAdjusted(_productId, availableInventoryOf(_productId));
  }

  /**
  * @dev decrementInventory - removes inventory levels for a product
  * @param _productId - the product id
  * @param _inventoryAdjustment - the amount to decrement
  */
  function decrementInventory(
    uint256 _productId,
    uint256 _inventoryAdjustment)
    public
    onlyCLevel
  {
    _decrementInventory(_productId, _inventoryAdjustment);
    ProductInventoryAdjusted(_productId, availableInventoryOf(_productId));
  }

  /**
  * @dev clearInventory - clears the inventory of a product. decrementInventory
  * verifies inventory levels, whereas this method simply sets the inventory to
  * zero. This is useful, for example, if an executive wants to take a product
  * off the market quickly. There could be a race condition with
  * decrementInventory where a product is sold, which could cause the admins
  * decrement to fail (because it may try to decrement more than available).
  *
  * @param _productId - the product id
  */
  function clearInventory(uint256 _productId)
    public
    onlyCLevel
  {
    _clearInventory(_productId);
    ProductInventoryAdjusted(_productId, availableInventoryOf(_productId));
  }

  /**
  * @dev setPrice - sets the price of a product
  * @param _productId - the product id
  * @param _price - the product price
  */
  function setPrice(uint256 _productId, uint256 _price)
    public
    onlyCLevel
  {
    _setPrice(_productId, _price);
    ProductPriceChanged(_productId, _price);
  }

  /** anyone **/
  function priceOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].price;
  }

  function availableInventoryOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].available;
  }

  function totalSupplyOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].supply;
  }

  function totalSold(uint256 _productId) public view returns (uint256) {
    return products[_productId].sold;
  }

  function productInfo(uint256 _productId) public view returns (uint256, uint256, uint256) {
    return (priceOf(_productId), availableInventoryOf(_productId), totalSupplyOf(_productId));
  }

  function getAllProductIds() public view returns (uint256[]) {
    return allProductIds;
  }
}
