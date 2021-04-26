import { defaultAbiCoder, Interface } from '@ethersproject/abi';
import { bytecode as SigmaControllerV1 } from './upgrades/SigmaControllerV1.json';
export { bytecode as SigmaPoolBytecode } from './upgrades/SigmaIndexPoolV1.json';
export { bytecode as CorePoolBytecode } from './upgrades/IndexPool.json';
import { bytecode as CoreController } from './upgrades/MarketCapSqrtController.json';

import { addresses } from '../utils';

const {
  Governance,
  UniswapOracle,
  PoolFactory,
  ProxyManager
} = addresses;


const ControllerArgs = [
  UniswapOracle,
  PoolFactory,
  ProxyManager,
  Governance
];

export const SigmaControllerBytecode = [
  SigmaControllerV1,
  defaultAbiCoder.encode(['address','address','address','address'], ControllerArgs).slice(2)
].join('');

export const CoreControllerBytecode = [
  CoreController,
  defaultAbiCoder.encode(['address','address','address'], ControllerArgs.slice(0, 3)).slice(2)
].join('');

