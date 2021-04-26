import { Interface } from "@ethersproject/abi";
import { getBigNumber, addresses, implementationHashes, getFunctionSignatureAndCalldata, encodeFunctionCall } from "../../utils";
import { ProposalTransaction, TestProposalTransaction } from '../types';

const {
  CC10,
  CoreController,
  DEFI5,
  DEGEN,
  NFTP,
  ORCL5,
  ProxyManagerAccessControl,
  SigmaControllerV1,
  Timelock
} = addresses;

const { IndexPoolImplementationID, SigmaPoolImplementationID } = implementationHashes;

import { IProxyManagerAccessControl } from '../../typechain/IProxyManagerAccessControl';
import { ISigmaControllerV1 } from '../../typechain/ISigmaControllerV1';
import { IMarketCapSqrtController } from '../../typechain/IMarketCapSqrtController';
import { abi as ProxyManagerAccessControlABI } from '../../artifacts/contracts/interfaces/IProxyManagerAccessControl.sol/IProxyManagerAccessControl.json';
import { abi as CoreControllerABI } from '../../artifacts/contracts/interfaces/IMarketCapSqrtController.sol/IMarketCapSqrtController.json';
import { abi as SigmaControllerABI } from '../../artifacts/contracts/interfaces/ISigmaControllerV1.sol/ISigmaControllerV1.json';

const coreControllerInterface = new Interface(CoreControllerABI) as IMarketCapSqrtController['interface'];
const sigmaControllerInterface = new Interface(SigmaControllerABI) as ISigmaControllerV1['interface'];
const proxyManagerInterface = new Interface(ProxyManagerAccessControlABI) as IProxyManagerAccessControl['interface'];

const sigmaControllerUpgrade = '0xE8721b30211F3b487F02173D054F704301983423'
const sigmaPoolUpgrade = '0xf0204D5aEA78F7d9EbE0E0c4fB21fA67426BFefc';

const coreControllerUpgrade = '0x120C6956D292B800A835cB935c9dd326bDB4e011';
const corePoolUpgrade = '0x5bD628141c62a901E0a83E630ce5FaFa95bBdeE4';

export const ProposalTransactions: ProposalTransaction[] = [
  {
    to: ProxyManagerAccessControl,
    ...(getFunctionSignatureAndCalldata(
      proxyManagerInterface,
      'setImplementationAddressOneToOne',
      [SigmaControllerV1, sigmaControllerUpgrade]
    ))
  }, {
    to: ProxyManagerAccessControl,
    ...(getFunctionSignatureAndCalldata(
      proxyManagerInterface,
      'setImplementationAddressManyToOne',
      [SigmaPoolImplementationID, sigmaPoolUpgrade]
    ))
  }, {
    to: ProxyManagerAccessControl,
    ...(getFunctionSignatureAndCalldata(
      proxyManagerInterface,
      'setImplementationAddressOneToOne',
      [CoreController, coreControllerUpgrade])
    )
  }, {
    to: ProxyManagerAccessControl,
    ...(getFunctionSignatureAndCalldata(
      proxyManagerInterface,
      'setImplementationAddressManyToOne',
      [IndexPoolImplementationID, corePoolUpgrade]
    ))
  }, {
    to: CoreController,
    ...(getFunctionSignatureAndCalldata(
      coreControllerInterface,
      'setDefaultExitFeeRecipient',
      [Timelock]
    ))
  }, {
    to: SigmaControllerV1,
    ...(getFunctionSignatureAndCalldata(
      sigmaControllerInterface,
      'setDefaultExitFeeRecipient',
      [Timelock]
    ))
  }, {
    to: CoreController,
    ...(getFunctionSignatureAndCalldata(
      coreControllerInterface,
      'setExitFeeRecipient(address[],address)',
      [[CC10, DEFI5, ORCL5], Timelock]
    ))
  }, {
    to: CoreController,
    ...(getFunctionSignatureAndCalldata(
      coreControllerInterface,
      'setSwapFee(address[],uint256)',
      [[CC10, DEFI5, ORCL5], getBigNumber(2, 16)]
    ))
  }, {
    to: SigmaControllerV1,
    ...(getFunctionSignatureAndCalldata(
      sigmaControllerInterface,
      'setSwapFee(address[],uint256)',
      [[DEGEN, NFTP], getBigNumber(2, 16)]
    ))
  }
];

export const TestProposalTransactions: TestProposalTransaction[] = ProposalTransactions.map(({
  to,
  signature,
  calldata,
  value
}) => ({
  to,
  data: encodeFunctionCall(signature, calldata),
  value
}));