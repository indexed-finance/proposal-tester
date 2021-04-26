// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

import "./IScoredTokenLists.sol";

interface IControllerConstants {  
  function INITIALIZER_IMPLEMENTATION_ID() external view returns(bytes32);

  function SELLER_IMPLEMENTATION_ID() external view returns(bytes32);

  function POOL_IMPLEMENTATION_ID() external view returns(bytes32);

  function POOL_REWEIGH_DELAY() external view returns (uint256);

  function REWEIGHS_BEFORE_REINDEX() external view returns (uint8);

  function SHORT_TWAP_MIN_TIME_ELAPSED() external view returns (uint32);

  function SHORT_TWAP_MAX_TIME_ELAPSED() external view returns (uint32);

  function MIN_INDEX_SIZE() external view returns (uint256);

  function MAX_INDEX_SIZE() external view returns (uint256);

  function MIN_BALANCE() external view returns (uint256);
}

interface ISigmaControllerV1 is IScoredTokenLists, IControllerConstants {
/* ==========  Constants  ========== */
  function poolFactory() external view returns (address);

  function proxyManager() external view returns (address);

  function governance() external view returns (address);

/* ==========  Storage  ========== */

  struct IndexPoolMeta {
    bool initialized;
    uint16 listID;
    uint8 indexSize;
    uint8 reweighIndex;
    uint64 lastReweigh;
  }

  // Default slippage rate for token seller contracts.
  function defaultSellerPremium() external view returns (uint8);

  function indexPoolMetadata(address) external view returns (IndexPoolMeta memory);

  function circuitBreaker() external view returns (address);

  function defaultExitFeeRecipient() external view returns (address);


/* ==========  Initializer  ========== */
  function initialize(address circuitBreaker_) external;

/* ==========  Configuration  ========== */
  function setDefaultSellerPremium(uint8 _defaultSellerPremium) external;

  function setCircuitBreaker(address circuitBreaker_) external;

  function setDefaultExitFeeRecipient(address defaultExitFeeRecipient_) external;

/* ==========  Pool Deployment  ========== */
  function prepareIndexPool(
    uint256 listID,
    uint256 indexSize,
    uint256 initialWethValue,
    string calldata name,
    string calldata symbol
  ) external returns (address poolAddress, address initializerAddress);

  function finishPreparedIndexPool(
    address poolAddress,
    address[] calldata tokens,
    uint256[] calldata balances
  ) external;

/* ==========  Pool Management  ========== */
  function updateSellerPremium(address tokenSeller, uint8 premiumPercent) external;

  function setSwapFee(address poolAddress, uint256 swapFee) external;

  function setSwapFee(address[] calldata poolAddresses, uint256 swapFee) external;

  function setController(address poolAddress, address controller) external;

  function setExitFeeRecipient(address poolAddress, address exitFeeRecipient) external;

  function setExitFeeRecipient(address[] calldata poolAddresses, address exitFeeRecipient) external;

  function updateMinimumBalance(address pool, address tokenAddress) external;

  function delegateCompLikeTokenFromPool(
    address pool,
    address token,
    address delegatee
  ) external;

  function setPublicSwap(address indexPool_, bool publicSwap) external;

/* ==========  Pool Rebalance Actions  ========== */
  function reindexPool(address poolAddress) external;
  
  function forceReindexPool(address poolAddress) external;
  
  function reweighPool(address poolAddress) external;

/* ==========  Pool Queries  ========== */
  function computeInitializerAddress(address poolAddress) external view returns (address initializerAddress);

  function computeSellerAddress(address poolAddress) external view returns (address sellerAddress);

  function computePoolAddress(uint256 listID, uint256 indexSize) external view returns (address poolAddress);

  /**
   * @dev Queries the top `indexSize` tokens in a list from the market oracle,
   * computes their relative weights and determines the weighted balance of each
   * token to meet a specified total value.
   */
  function getInitialTokensAndBalances(
    uint256 listID,
    uint256 indexSize,
    uint256 wethValue
  )
    external
    view
    returns (
      address[] memory tokens,
      uint256[] memory balances
    );
}
