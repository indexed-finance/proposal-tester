// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;


interface IMarketCapSortedTokenCategories {
/* ==========  Constants  ========== */

  function oracle() external view returns(address);

/* ==========  Storage  ========== */

  // Number of categories that exist.
  function categoryIndex() external view returns (uint256);

/* ==========  Initializer  ========== */

  function initialize() external;

/* ==========  Category Management  ========== */

  function updateCategoryPrices(uint256 categoryID) external returns (bool[] memory pricesUpdated);

  function createCategory(bytes32 metadataHash) external;

  function addToken(uint256 categoryID, address token) external;

  function addTokens(uint256 categoryID, address[] calldata tokens) external;

  function removeToken(uint256 categoryID, address token) external;

  function orderCategoryTokensByMarketCap(uint256 categoryID) external;

/* ==========  Market Cap Queries  ========== */

  function computeAverageMarketCap(address token) external view returns (uint144);

  function computeAverageMarketCaps(address[] memory tokens)
    external
    view
    returns (uint144[] memory marketCaps);

/* ==========  Category Queries  ========== */
  function hasCategory(uint256 categoryID) external view returns (bool);

  function getLastCategoryUpdate(uint256 categoryID) external view returns (uint256);

  function isTokenInCategory(uint256 categoryID, address token) external view returns (bool);

  function getCategoryTokens(uint256 categoryID) external view returns (address[] memory tokens);

  function getCategoryMarketCaps(uint256 categoryID) external view returns (uint144[] memory marketCaps);

  function getTopCategoryTokens(uint256 categoryID, uint256 num) external view returns (address[] memory tokens);
}