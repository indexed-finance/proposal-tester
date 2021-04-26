# @indexed-finance/proposal-tester

Hardhat package for testing contract upgrades and other proposals before executing them on-chain.

This uses the mainnet forking feature of hardhat to execute tests against already deployed contracts.

In order to run the tests, you will need to add an Alchemy API Key to .env, or configure hardhat.config.ts for use with a different provider that supports archival features. The free version of Alchemy supports this, which is why it is the default.

See .env.example for an example env configuration.

## Scripts

`yarn test`

Runs all tests in `test/`

`yarn coverage`

Runs all tests with solidity-coverage and generates a coverage report.

`yarn compile`

Compiles artifacts into `artifacts/` and generates typechain interfaces in `typechain/`

`yarn lint`

Runs solhint against the contracts.
