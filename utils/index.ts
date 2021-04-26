import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { keccak256 } from "@ethersproject/keccak256";

import { Interface } from "@ethersproject/abi";
import { IProxyManagerAccessControl } from '../typechain/IProxyManagerAccessControl'
import { abi as ProxyManagerAccessControlABI } from '../artifacts/contracts/interfaces/IProxyManagerAccessControl.sol/IProxyManagerAccessControl.json';
import { toUtf8Bytes } from '@ethersproject/strings';
import { concat, hexDataSlice, hexlify } from '@ethersproject/bytes';

export * as addresses from './addresses'
export * from './implementationHashes';

export function getBigNumber(n: number, decimals = 18) {
  return BigNumber.from(10).pow(decimals).mul(n);
}

export async function getContract<C extends Contract>(address: string, name: string): Promise<C> {
  let contract = await ethers.getContractAt(name, address);
  return contract as C;
}

type IProxyManagerAccessControlInterface = IProxyManagerAccessControl['interface'];
const proxyManagerInterface = new Interface(ProxyManagerAccessControlABI) as IProxyManagerAccessControlInterface;

export const encodePoolUpgrade = (hash: string, implementation: string) => proxyManagerInterface.encodeFunctionData(
  'setImplementationAddressManyToOne',
  [hash, implementation]
);

export const encodeControllerUpgrade = (proxy: string, implementation: string) => proxyManagerInterface.encodeFunctionData(
  'setImplementationAddressOneToOne',
  [proxy, implementation]
);

export function getFunctionSignatureAndCalldata(iface: Interface, functionName: string, args: any[]): { signature: string; calldata: string; } {
  const fn = iface.getFunction(functionName);
  const signature = fn.format();
  const calldata = iface._encodeParams(fn.inputs, args);
  return { signature, calldata };
}

export function encodeFunctionCall(signature: string, calldata: string): string {
  const sigHash = hexDataSlice(keccak256(toUtf8Bytes(signature)), 0, 4);
  return hexlify(concat([
    sigHash,
    calldata
  ]));
}