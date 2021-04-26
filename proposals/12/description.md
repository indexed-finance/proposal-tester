# Upgrade Proxies for Index Pools and Controllers

## Summary

The main impetus for this set of upgrades is the current issue in DEGEN - the rebalance is being delayed and mints/swaps blocked in many cases due to the pool having hit its max weight when RGT was added. An upgrade was required to fix this, so I decided to add some other changes that were due for a merge.

Some queries and events will be added to simplify subgraph tracking and keeper management. Exit fees of 0.5% will be added to the core pools and the default swap fee will be set to 2% across the board. Some new control functions will be added to allow governance to update parameters without further proxy upgrades.

### Transactions

1. Set proxy implementation for SigmaControllerV1.sol to `0xE8721b30211F3b487F02173D054F704301983423`
2. Set proxy implementation for SigmaIndexPoolV1.sol to `0xf0204D5aEA78F7d9EbE0E0c4fB21fA67426BFefc`
3. Set proxy implementation for MarketCapSqrtController.sol to `0x120C6956D292B800A835cB935c9dd326bDB4e011`
4. Set proxy implementation for IndexPool.sol to `0x5bD628141c62a901E0a83E630ce5FaFa95bBdeE4`
5. Set default exit fee recipient for core controller to the treasury
6. Set default exit fee recipient for Sigma controller to the treasury
	- This value was previously an immutable in the contract bytecode, so we will not be changing the recipient, only adding it to storage.
7. Set exit fee recipient on CC10, DEFI5, ORCL5 to the treasury
8. Set swap fee on CC10, DEFI5, ORCL5 to 2%
9. Set swap fee on DEGEN, NFTP to 2%

### Code & Tests

Pull request with modifications to the sigma contracts:
https://github.com/indexed-finance/sigma-core/pull/23

Pull request with modifications to the core contracts:
https://github.com/indexed-finance/indexed-core/pull/68

Tests of this proposal's transactions against a fork of mainnet:
https://github.com/indexed-finance/proposal-tester

## Contract Modifications

This proposal would upgrade the proxy implementations for the following contracts:
- MarketCapSqrtController.sol
- IndexPool.sol
- SigmaControllerV1.sol
- SigmaIndexPoolV1.sol

### Controllers

- Add `setController` function.
  - Allows governance to set controller on an existing pool.
- Add `setExitFeeRecipient(address,address)` function.
	- Allows governance to update fee recipient on an existing pool.
- Add `setExitFeeRecipient(address[],address)` function.
  - Allows governance to update fee recipient on multiple existing pools.
- Add `setSwapFee(address[],address)` function.
  - Allows governance to update swap fee on multiple existing pools.
- Add `setDefaultExitFeeRecipient` function.
	- Allows governance to update default fee recipient for new pools.
- Add events `PoolReweighed` and `PoolReindexed` .
	- Enables easier subgraph tracking.

**Core Controller**

- Add `getPoolMeta` function.
	- Enables queries for reweigh timing.

**Sigma Controller**

- Add immutable `governance` address.
- Move `defaultExitFeeRecipient` from bytecode to storage.
- Add `validTokenList` modifier to function `getTokenScores`.
- Give governance control over `setSwapFee`.

### Index Pools

- Set default swap fee to 2% instead of 2.5%.
- Change reweigh behavior:
	- Weight changes which would exceed the maximum total weight will not occur rather than reverting.
	- Allow token weights to be updated once every 30 minutes instead of once every hour.
	- Weight decrease executed before weight increase in swap functions
- Set `MAX_TOTAL_WEIGHT` to 27 instead of 26 in order to be more flexible during re-indexing.
- Add `setController` function.
	- Allows current controller to set new controller.
- Add `getExitFee` function.
- Add events `LOG_EXIT_FEE_RECIPIENT_UPDATED` and `LOG_CONTROLLER_UPDATED`.
	- Enables easier subgraph tracking.

**Core Index Pool**

- Add exit fee of 0.5%.
- Send exit fees to `_exitFeeRecipient` instead of `_controller`.
- Add `setExitFeeRecipient`.
	- Allows controller to set fee recipient.
- Removed `flashBorrow` function.
	-  Not being used and code size is near maximum.

**Sigma Index Pool**

- Change `setExitFeeRecipient` call permission from only current fee recipient to only controller.