// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

interface IScoredTokenLists {
/* ========== Constants & Storage ========== */
  function owner() external view returns (address);

  function MAX_LIST_TOKENS() external view returns (uint256);

  function uniswapOracle() external view returns (address);

  function circulatingMarketCapOracle() external view returns (address);

  function tokenListCount() external view returns (uint256);

/* ========== Mutative ========== */
  function createTokenList(
    bytes32 metadataHash,
    address scoringStrategy,
    uint128 minimumScore,
    uint128 maximumScore
  ) external;

  function addToken(uint256 listID, address token) external;

  function addTokens(uint256 listID, address[] calldata tokens) external;

  function removeToken(uint256 listID, address token) external;

  function updateTokenPrices(uint256 listID) external;

  function sortAndFilterTokens(uint256 listID) external;

/* ==========  Score Queries  ========== */
  function getSortedAndFilteredTokensAndScores(uint256 listID)
    external
    view
    returns (
      address[] memory tokens,
      uint256[] memory scores
    );

  function isTokenInlist(uint256 listID, address token) external view returns (bool);
  
  function getTokenList(uint256 listID) external view returns (address[] memory tokens);

  function getTopTokensAndScores(uint256 listID, uint256 count)
    external
    view
    returns (
      address[] memory tokens,
      uint256[] memory scores
    );

  function getTokenListConfig(uint256 listID)
    external
    view
    returns (
      address scoringStrategy,
      uint128 minimumScore,
      uint128 maximumScore
    );

  function getTokenScores(uint256 listID, address[] calldata tokens)
    external
    view
    returns (uint256[] memory scores);
}