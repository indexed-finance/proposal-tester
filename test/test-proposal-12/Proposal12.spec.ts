import { ethers } from 'hardhat';
import { expect } from "chai";
import {
  ISigmaControllerV1,
  IIndexPool,
  IERC20,
  IMarketCapSqrtController
} from '../../typechain';
import { TestProposalTransactions } from '../../proposals/12/transactions';
import { stopImpersonating, sendEtherTo, getContract, sendTokenTo, getBigNumber, withSigner, addresses } from '../utils';
import { getAddress } from '@ethersproject/address';
import UpgradeTester, { TestData } from '../UpgradeTester';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, constants } from 'ethers';
const {
  Timelock,
  DEGEN,
  SigmaControllerV1,
  Governance,
  RSR,
  RUNE,
  DEFI5,
  CoreController,
  UNI,
  AAVE
} = addresses;

const MAX_PRICE = `0x${'ff'.repeat(32)}`;

describe('Proposal 12: Upgrades of Controllers & Index Pools', () => {
  let sigmaController: ISigmaControllerV1;
  let coreController: IMarketCapSqrtController;
  let degen: IIndexPool;
  let defi5: IIndexPool;
  let rsr: IERC20;
  let wallet: SignerWithAddress;
  let corePoolTester: UpgradeTester<IIndexPool>;
  let sigmaPoolTester: UpgradeTester<IIndexPool>;
  let sigmaControllerTester: UpgradeTester<ISigmaControllerV1>;
  let coreControllerTester: UpgradeTester<IMarketCapSqrtController>;
  let rsrAmount: BigNumber;

  before('Get Current Contracts', async () => {
    ([wallet] = await ethers.getSigners());
    await sendEtherTo(Governance);
    await sendEtherTo(SigmaControllerV1);
    await sendEtherTo(wallet.address);
    sigmaController = await getContract(SigmaControllerV1, 'ISigmaControllerV1');
    degen = await getContract(DEGEN, 'IIndexPool');
    rsr = await getContract(RSR, 'IERC20');
    rsrAmount = (await degen.getBalance(RSR)).div(50);
    await sendTokenTo(RSR, wallet.address, rsrAmount);
    await rsr.approve(DEGEN, rsrAmount);
    defi5 = await getContract(DEFI5, 'IIndexPool');
    coreController = await getContract(CoreController, 'IMarketCapSqrtController')
    
    sigmaPoolTester = new UpgradeTester(degen, SIGMA_POOL_TESTS());
    corePoolTester = new UpgradeTester(defi5, CORE_POOL_TESTS());
    sigmaControllerTester = new UpgradeTester(sigmaController, SIGMA_CONTROLLER_TESTS());
    coreControllerTester = new UpgradeTester(coreController, CORE_CONTROLLER_TESTS());
  });

  const SIGMA_CONTROLLER_TESTS = (): TestData<ISigmaControllerV1>[] => [
    // Constants
    {
      type: 'same_result',
      fn: 'INITIALIZER_IMPLEMENTATION_ID',
      args: []
    },
    {
      type: 'same_result',
      fn: 'SELLER_IMPLEMENTATION_ID',
      args: []
    },
    {
      type: 'same_result',
      fn: 'POOL_IMPLEMENTATION_ID',
      args: []
    },
    {
      type: 'same_result',
      fn: 'POOL_REWEIGH_DELAY',
      args: []
    },
    {
      type: 'same_result',
      fn: 'REWEIGHS_BEFORE_REINDEX',
      args: []
    },
    {
      type: 'same_result',
      fn: 'SHORT_TWAP_MIN_TIME_ELAPSED',
      args: []
    },
    {
      type: 'same_result',
      fn: 'SHORT_TWAP_MAX_TIME_ELAPSED',
      args: []
    },
    {
      type: 'same_result',
      fn: 'MIN_INDEX_SIZE',
      args: []
    },
    {
      type: 'same_result',
      fn: 'MAX_INDEX_SIZE',
      args: []
    },
    {
      type: 'same_result',
      fn: 'MIN_BALANCE',
      args: []
    },
    {
      type: 'same_result',
      fn: 'poolFactory',
      args: []
    },
    {
      type: 'same_result',
      fn: 'proxyManager',
      args: []
    },
    {
      type: 'fix_revert',
      fn: 'governance',
      args: [],
      resultAfter: getAddress(Governance)
    },
    {
      type: 'same_result',
      fn: 'owner',
      args: []
    },
    {
      type: 'same_result',
      fn: 'MAX_LIST_TOKENS',
      args: []
    },
    {
      type: 'same_result',
      fn: 'uniswapOracle',
      args: []
    },
    // Storage
    {
      type: 'same_result',
      fn: 'tokenListCount',
      args: []
    },
    {
      type: 'same_result',
      fn: 'isTokenInlist',
      args: [1, '0xD291E7a03283640FDc51b121aC401383A46cC623']
    },
    {
      type: 'same_result',
      fn: 'getTokenList',
      args: [1]
    },
    {
      type: 'same_result',
      fn: 'getTokenListConfig',
      args: [1]
    },
    {
      type: 'same_result',
      fn: 'defaultSellerPremium',
      args: []
    },
    {
      type: 'same_result',
      fn: 'indexPoolMetadata',
      args: [DEGEN]
    },
    {
      type: 'same_result',
      fn: 'circuitBreaker',
      args: []
    },
    {
      type: 'same_result',
      fn: 'defaultExitFeeRecipient',
      args: []
    },
    {
      type: 'fix_revert',
      fn: 'setExitFeeRecipient(address,address)',
      caller: Timelock,
      args: [DEGEN, SigmaControllerV1],
      before: async () => {
        expect(await degen.getExitFeeRecipient()).to.eq(getAddress(Timelock));
      },
      after: async () => {
        const controller = await getContract(SigmaControllerV1, 'ISigmaControllerV1', Timelock);
        expect(await degen.getExitFeeRecipient()).to.eq(getAddress(SigmaControllerV1));
        await controller['setExitFeeRecipient(address,address)'](DEGEN, Timelock);
        await stopImpersonating(Timelock);
      }
    },
    {
      type: 'fix_revert',
      fn: 'setController',
      caller: Timelock,
      args: [DEGEN, Timelock],
      before: async () => {
        expect(await degen.getController()).to.eq(getAddress(SigmaControllerV1));
      },
      after: async () => {
        const degen = await getContract<IIndexPool>(DEGEN, 'IIndexPool', Timelock);
        expect(await degen.getController()).to.eq(getAddress(Timelock));
        await degen.setController(SigmaControllerV1);
        await stopImpersonating(Timelock);
      }
    },
    {
      type: 'fix_revert',
      fn: 'setDefaultExitFeeRecipient',
      caller: Timelock,
      args: [`0x${'11'.repeat(20)}`],
      before: async () => {
        expect(await sigmaController.defaultExitFeeRecipient()).to.eq(getAddress(Timelock));
      },
      after: async () => {
        expect(await sigmaController.defaultExitFeeRecipient()).to.eq(getAddress(`0x${'11'.repeat(20)}`));
      }
    }, {
      type: 'fix_revert',
      fn: 'setSwapFee(address,uint256)',
      caller: Timelock,
      args: [DEGEN, getBigNumber(2, 16)]
    }
  ];

  const SIGMA_POOL_TESTS = (): TestData<IIndexPool>[] => [
    {
      type: 'same_result',
      fn: 'isPublicSwap',
      args: []
    },
    {
      type: 'different_result',
      fn: 'getSwapFee',
      args: [],
      resultBefore: getBigNumber(5, 16).div(2),
      resultAfter: getBigNumber(2, 16)
    },
    {
      type: 'fix_revert',
      fn: 'getExitFee',
      resultAfter: getBigNumber(5).div(1000),
      args: []
    },
    {
      type: 'same_result',
      fn: 'getController',
      args: []
    },
    {
      type: 'same_result',
      fn: 'getExitFeeRecipient',
      args: []
    },
    {
      type: 'same_result',
      fn: 'getNumTokens',
      args: []
    },
    {
      type: 'same_result',
      fn: 'getCurrentTokens',
      args: []
    },
    {
      type: 'same_result',
      fn: 'getCurrentDesiredTokens',
      args: []
    },
    {
      type: 'same_result',
      fn: 'extrapolatePoolValueFromToken',
      args: []
    },
    {
      type: 'same_result',
      fn: 'getTotalDenormalizedWeight',
      args: []
    },
    {
      type: 'same_result',
      fn: 'isBound',
      args: [RSR]
    },
    {
      type: 'same_result',
      fn: 'isBound',
      args: [constants.AddressZero]
    },
    {
      type: 'same_result',
      fn: 'getDenormalizedWeight',
      args: [RSR]
    },
    {
      type: 'same_result',
      fn: 'getTokenRecord',
      args: [RSR]
    },
    {
      type: 'same_result',
      fn: 'getBalance',
      args: [RSR]
    },
    {
      type: 'same_result',
      fn: 'getUsedBalance',
      args: [RSR]
    },
    {
      type: 'different_result',
      fn: 'getSpotPrice',
      args: [RSR, RUNE]
    },
    {
      type: 'fix_revert',
      fn: 'swapExactAmountIn',
      args: [
        RSR,
        rsrAmount,
        RUNE,
        0,
        MAX_PRICE
      ],
    },
  ];

  const CORE_POOL_TESTS = (): TestData<IIndexPool>[] => [
    {
      type: 'same_result',
      fn: 'isPublicSwap',
      args: []
    },
    {
      type: 'different_result',
      fn: 'getSwapFee',
      args: [],
      resultBefore: getBigNumber(5, 16).div(2),
      resultAfter: getBigNumber(2, 16)
    },
    {
      type: 'fix_revert',
      fn: 'getExitFee',
      resultAfter: getBigNumber(5).div(1000),
      args: []
    },
    {
      type: 'same_result',
      fn: 'getController',
      args: []
    },
    {
      type: 'fix_revert',
      fn: 'getExitFeeRecipient',
      args: [],
      resultAfter: Timelock
    },
    {
      type: 'same_result',
      fn: 'getNumTokens',
      args: []
    },
    {
      type: 'same_result',
      fn: 'getCurrentTokens',
      args: []
    },
    {
      type: 'same_result',
      fn: 'getCurrentDesiredTokens',
      args: []
    },
    {
      type: 'same_result',
      fn: 'extrapolatePoolValueFromToken',
      args: []
    },
    {
      type: 'same_result',
      fn: 'getTotalDenormalizedWeight',
      args: []
    },
    {
      type: 'same_result',
      fn: 'isBound',
      args: [UNI]
    },
    {
      type: 'same_result',
      fn: 'isBound',
      args: [constants.AddressZero]
    },
    {
      type: 'same_result',
      fn: 'getDenormalizedWeight',
      args: [UNI]
    },
    {
      type: 'same_result',
      fn: 'getTokenRecord',
      args: [UNI]
    },
    {
      type: 'same_result',
      fn: 'getBalance',
      args: [UNI]
    },
    {
      type: 'same_result',
      fn: 'getUsedBalance',
      args: [UNI]
    },
    {
      type: 'different_result',
      fn: 'getSpotPrice',
      args: [UNI, AAVE]
    }
  ];

  const CORE_CONTROLLER_TESTS = (): TestData<IMarketCapSqrtController>[] => [
    {
      type: 'same_result',
      fn: 'owner',
      args: []
    },
    {
      type: 'same_result',
      fn: 'oracle',
      args: []
    },
    {
      type: 'same_result',
      fn: 'categoryIndex',
      args: []
    },
    {
      type: 'same_result',
      fn: 'hasCategory',
      args: [1]
    },
    {
      type: 'same_result',
      fn: 'getLastCategoryUpdate',
      args: [1]
    }, {
      type: 'same_result',
      fn: 'isTokenInCategory',
      args: [2, UNI]
    }, {
      type: 'same_result',
      fn: 'getCategoryTokens',
      args: [1]
    }, {
      type: 'same_result',
      fn: 'defaultSellerPremium',
      args: []
    }, {
      type: 'fix_revert',
      fn: 'defaultExitFeeRecipient',
      args: [],
      resultAfter: Timelock
    }, {
      type: 'fix_revert',
      fn: 'setExitFeeRecipient(address,address)',
      caller: Timelock,
      args: [DEFI5, Timelock]
    }
  ];

  describe('Current contracts return expected results', () => {
    it('SigmaControllerV1', async () => {
      await sigmaControllerTester.runAgainstCurrent();
    });

    it('MarketCapSqrtController', async () => {
      await coreControllerTester.runAgainstCurrent();
    });

    it('SigmaIndexPoolV1', async () => {
      await sigmaPoolTester.runAgainstCurrent();
    });

    it('IndexPool', async () => {
      await corePoolTester.runAgainstCurrent();
    });
  });

  describe('Execute Upgrades', () => {
    // let sigmaControllerUpgrade: string;
    // let sigmaPoolUpgrade: string;
    // let coreControllerUpgrade: string;
    // let corePoolUpgrade: string;

    // it('Deploy upgrades', async () => {
    //   sigmaControllerUpgrade = await deploy(SigmaControllerBytecode);
    //   sigmaPoolUpgrade = await deploy(SigmaPoolBytecode);
    //   coreControllerUpgrade = await deploy(CoreControllerBytecode);
    //   corePoolUpgrade = await deploy(CorePoolBytecode);
    // });

    it('Executes proposal transactions', async () => {
      const transactions = TestProposalTransactions; //getProposalTransactions(sigmaControllerUpgrade, sigmaPoolUpgrade, coreControllerUpgrade, corePoolUpgrade);
      await withSigner(Timelock, async (signer) => {
        for (const { to, data } of transactions) {
          await signer.sendTransaction({ to, data });
        }
      })
    })
  })

  describe('Upgraded contracts return expected results', () => {
    it('SigmaControllerV1', async () => {
      await sigmaControllerTester.runAgainstUpgrade();
    });

    it('MarketCapSqrtController', async () => {
      await coreControllerTester.runAgainstUpgrade();
    });

    it('SigmaIndexPoolV1', async () => {
      await sigmaPoolTester.runAgainstUpgrade();
    });

    it('IndexPool', async () => {
      await corePoolTester.runAgainstUpgrade();
    });
  });
})