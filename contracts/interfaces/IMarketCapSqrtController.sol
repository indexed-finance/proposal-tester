// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.6.0;
pragma experimental ABIEncoderV2;

/* ========== Internal Inheritance ========== */
import "./IMarketCapSortedTokenCategories.sol";

interface IMarketCapSqrtController is IMarketCapSortedTokenCategories {

/* ==========  Structs  ========== */
  struct IndexPoolMeta {
    bool initialized;
    uint16 categoryID;
    uint8 indexSize;
    uint8 reweighIndex;
    uint64 lastReweigh;
  }

/* ==========  Storage  ========== */

  function defaultSellerPremium() external view returns (uint8);

  function defaultExitFeeRecipient() external view returns (address);

  function owner() external view returns (address);

/* ==========  Pool Deployment  ========== */

  function prepareIndexPool(
    uint256 categoryID,
    uint256 indexSize,
    uint256 initialWethValue,
    string calldata name,
    string calldata symbol
  )
    external
    returns (address poolAddress, address initializerAddress);

  /**
   * @dev Initializes a pool which has been deployed but not initialized
   * and transfers the underlying tokens from the initialization pool to
   * the actual pool.
   */
  function finishPreparedIndexPool(
    address poolAddress,
    address[] calldata tokens,
    uint256[] calldata balances
  ) external;

/* ==========  Pool Management  ========== */

  function setDefaultSellerPremium(uint8 _defaultSellerPremium) external;

  function updateSellerPremium(address tokenSeller, uint8 premiumPercent) external;

  function setDefaultExitFeeRecipient(address defaultExitFeeRecipient_) external;

  function setExitFeeRecipient(address poolAddress, address exitFeeRecipient) external;

  function setExitFeeRecipient(address[] calldata poolAddresses, address exitFeeRecipient) external;

  function setSwapFee(address poolAddress, uint256 swapFee) external;

  function setSwapFee(address[] calldata poolAddresses, uint256 swapFee) external;

  function setController(address poolAddress, address controller) external;

  function updateMinimumBalance(address pool, address tokenAddress) external;

  function delegateCompLikeTokenFromPool(
    address pool,
    address token,
    address delegatee
  )
    external;

/* ==========  Pool Rebalance Actions  ========== */

  function reindexPool(address poolAddress) external;

  function reweighPool(address poolAddress) external;

/* ==========  Pool Queries  ========== */

  function computeInitializerAddress(address poolAddress) external view returns (address initializerAddress);

  function computeSellerAddress(address poolAddress) external view returns (address sellerAddress);

  function computePoolAddress(uint256 categoryID, uint256 indexSize) external view returns (address poolAddress);

  function getPoolMeta(address poolAddress) external view returns (IndexPoolMeta memory meta);

  function getInitialTokensAndBalances(
    uint256 categoryID,
    uint256 indexSize,
    uint144 wethValue
  )
    external
    view
    returns (
      address[] memory tokens,
      uint256[] memory balances
    );
}