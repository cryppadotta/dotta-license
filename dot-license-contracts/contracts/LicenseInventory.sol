pragma solidity ^0.4.19;

import "./LicenseBase.sol";
import "./math/SafeMath.sol";

/**
 * @title LicenseInventory
 * @notice LicenseInventory controls the products and inventory for those products
 **/
contract LicenseInventory is LicenseBase {
  using SafeMath for uint256;

  event ProductCreated(
    uint256 id,
    uint256 price,
    uint256 available,
    uint256 supply,
    uint256 interval
  );
  event ProductInventoryAdjusted(uint256 productId, uint256 available);
  event ProductPriceChanged(uint256 productId, uint256 price);

  struct Product {
    uint256 id;
    uint256 price;
    uint256 available;
    uint256 supply;
    uint256 sold;
    uint256 interval;
  }

  // @notice All products in existence
  uint256[] public allProductIds;

  // @notice A mapping from product ids to Products
  mapping (uint256 => Product) public products;

  /*** internal ***/

  /**
   * @notice _productExists checks to see if a product exists
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
    uint256 _supply,
    uint256 _interval)
    internal
  {
    require(_productDoesNotExist(_productId));
    require(_initialInventoryQuantity <= _supply);

    Product memory _product = Product({
      id: _productId,
      price: _initialPrice,
      available: _initialInventoryQuantity,
      supply: _supply,
      sold: 0,
      interval: _interval
    });

    products[_productId] = _product;
    allProductIds.push(_productId);

    ProductCreated(
      _product.id,
      _product.price,
      _product.available,
      _product.supply,
      _product.interval);
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
   * @notice createProduct creates a new product in the system
   * @param _productId - the id of the product to use (cannot be changed)
   * @param _initialPrice - the starting price (price can be changed)
   * @param _initialInventoryQuantity - the initial inventory (inventory can be changed)
   * @param _supply - the total supply - use `0` for "unlimited" (cannot be changed)
   */
  function createProduct(
    uint256 _productId,
    uint256 _initialPrice,
    uint256 _initialInventoryQuantity,
    uint256 _supply,
    uint256 _interval)
    public
    onlyCEOOrCOO
  {
    _createProduct(
      _productId,
      _initialPrice,
      _initialInventoryQuantity,
      _supply,
      _interval);
  }

  /**
   * @notice incrementInventory - increments the inventory of a product
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
  * @notice decrementInventory removes inventory levels for a product
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
  * @notice clearInventory clears the inventory of a product.
  * @dev decrementInventory verifies inventory levels, whereas this method
  * simply sets the inventory to zero. This is useful, for example, if an
  * executive wants to take a product off the market quickly. There could be a
  * race condition with decrementInventory where a product is sold, which could
  * cause the admins decrement to fail (because it may try to decrement more
  * than available).
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
  * @notice setPrice - sets the price of a product
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

  /**
  * @notice The price of a product
  * @param _productId - the product id
  */
  function priceOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].price;
  }

  /**
  * @notice The available inventory of a product
  * @param _productId - the product id
  */
  function availableInventoryOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].available;
  }

  /**
  * @notice The total supply of a product
  * @param _productId - the product id
  */
  function totalSupplyOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].supply;
  }

  /**
  * @notice The total sold of a product
  * @param _productId - the product id
  */
  function totalSold(uint256 _productId) public view returns (uint256) {
    return products[_productId].sold;
  }

  /**
  * @notice The renewal interval of a product in seconds
  * @param _productId - the product id
  */
  function intervalOf(uint256 _productId) public view returns (uint256) {
    return products[_productId].interval;
  }

  /**
  * @notice The product info for a product
  * @param _productId - the product id
  */
  function productInfo(uint256 _productId) public view returns (uint256, uint256, uint256, uint256) {
    return (
      priceOf(_productId),
      availableInventoryOf(_productId),
      totalSupplyOf(_productId),
      intervalOf(_productId));
  }

  /**
  * @notice Get all product ids
  */
  function getAllProductIds() public view returns (uint256[]) {
    return allProductIds;
  }

  /**
   * @notice returns the total cost to renew a product for a number of cycles
   * @dev If a product is a subscription, the interval defines the period of
   * time, in seconds, users can subscribe for. E.g. 1 month or 1 year.
   * _numCycles is the number of these intervals we want to use in the
   * calculation of the price.
   *
   * We require that the end user send precisely the amount required (instead
   * of dealing with excess refunds). This method is public so that clients can
   * read the exact amount our contract expects to receive.
   *
   * @param _productId - the product we're calculating for
   * @param _numCycles - the number of cycles to calculate for
   */
  function costForProductCycles(uint256 _productId, uint256 _numCycles) public view returns (uint256) {
    return priceOf(_productId).mul(_numCycles);
  }

  /**
   * @notice returns if this product is a subscription or not
   * @dev Some products are subscriptions and others are not. An interval of 0
   * means the product is not a subscription
   * @param _productId - the product we're checking
   */
  function isSubscriptionProduct(uint256 _productId) public view returns (bool) {
    return intervalOf(_productId) > 0;
  }

}
