# Permissions

| function                      | CEO | CFO | COO | anyone |
| ----------------------------- | --- | --- | --- | ------ |
| **LicenseAccessControl**      |     |     |     |        |
| `setCEO`                      | ✔   |     |     |        |
| `setCFO`                      | ✔   |     |     |        |
| `setCOO`                      | ✔   |     |     |        |
| `setWithdrawalAddress`        | ✔   |     |     |        |
| `withdrawBalance`             | ✔   | ✔   |     |        |
| `pause`                       | ✔   | ✔   | ✔   |        |
| `unpause`                     | ✔   |     |     |        |
|                               |     |     |     |        |
| **LicenseBase**               |     |     |     |        |
| `licenseProductId`            |     |     |     | ✔      |
| `licenseAttributes`           |     |     |     | ✔      |
| `licenseIssuedTime`           |     |     |     | ✔      |
| `licenseInfo`                 |     |     |     | ✔      |
|                               |     |     |     |        |
| **LicenseInventory**          |     |     |     |        |
| `createProduct`               | ✔   |     | ✔   |        |
| `incrementInventory`          | ✔   | ✔   | ✔   |        |
| `decrementInventory`          | ✔   | ✔   | ✔   |        |
| `clearInventory`              | ✔   | ✔   | ✔   |        |
| `setPrice`                    | ✔   | ✔   | ✔   |        |
| `priceOf`                     |     |     |     | ✔      |
| `availableInventoryOf`        |     |     |     | ✔      |
| `totalSupplyOf`               |     |     |     | ✔      |
| `totalSold`                   |     |     |     | ✔      |
| `productInfo`                 |     |     |     | ✔      |
| `getAllProductIds`            |     |     |     | ✔      |
|                               |     |     |     |        |
| **LicenseOwnership** (ERC721) |     |     |     |        |
| `name`                        |     |     |     | ✔      |
| `symbol`                      |     |     |     | ✔      |
| `implementsERC721`            |     |     |     | ✔      |
| `supportsInterface`           |     |     |     | ✔      |
| `totalSupply`                 |     |     |     | ✔      |
| `balanceOf`                   |     |     |     | ✔      |
| `tokensOf`                    |     |     |     | ✔      |
| `ownerOf`                     |     |     |     | ✔      |
| `approvedFor`                 |     |     |     | ✔      |
| `isApprovedForAll`       |     |     |     | ✔      |
| `transfer`                    |     |     |     | ✔      |
| `approve`                     |     |     |     | ✔      |
| `approveAll`                  |     |     |     | ✔      |
| `disapproveAll`               |     |     |     | ✔      |
| `takeOwnership`               |     |     |     | ✔      |
| `transferFrom`                |     |     |     | ✔      |
|                               |     |     |     |        |
| **LicenseSale**               |     |     |     |        |
| `setAffiliateProgramAddress`  | ✔   |     |     |        |
| `createPromotionalPurchase`   |     |     | ✔   |        |
| `purchase`                    |     |     |     | ✔      |
|                               |     |     |     |        |
| **LicenseCore**               |     |     |     |        |
| `setNewAddress`               | ✔   |     |     |        |
| `unpause`                     | ✔   |     |     |        |
