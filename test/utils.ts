import { getCreate2Address } from '@ethersproject/address';
import { JsonRpcSigner } from '@ethersproject/providers';
import { keccak256 } from '@ethersproject/keccak256';
import { BigNumber, Contract } from 'ethers';
import { ethers, network } from 'hardhat';
import { IERC20 } from '../typechain/IERC20';
import { getContract as getContractBase, sha3, getBigNumber, addresses, implementationHashes } from '../utils';
export { sha3, getBigNumber, addresses, implementationHashes };



//#region Fork utils

export async function impersonate(address: string) {
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address]
  });
  return ethers.provider.getSigner(address);
}

export async function stopImpersonating(address: string) {
  await network.provider.request({
    method: "hardhat_stopImpersonatingAccount",
    params: [address]
  });
}

export async function resetFork() {
  await network.provider.request({
    method: 'hardhat_reset',
    params: [{
      forking: {
        jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/`,
        blockNumber: 12313413
      }
    }]
  })
}
//#endregion

//#region Impersonation utils
export async function withSigner(address: string, fn: (signer: JsonRpcSigner) => Promise<void>) {
  const signer = await impersonate(address);
  await fn(signer);
  await stopImpersonating(address);
}

export const sendEtherTo = (address: string) => withSigner(addresses.WETH, async (signer) => {
  const factory = await ethers.getContractFactory('SendEth');
  const tx = await factory.getDeployTransaction(address);
  await signer.sendTransaction({ data: tx.data, value: BigNumber.from(10).pow(20) });
});

export async function sendTokenTo(erc20: string, to: string, amount: BigNumber) {
  const pair = computeUniswapPairAddress(erc20, addresses.WETH);
  const token = (await ethers.getContractAt('IERC20', erc20)) as IERC20;
  await sendEtherTo(pair);
  await withSigner(pair, async (signer) => {
    await token.connect(signer).transfer(to, amount);
  });
}

export async function getContract<C extends Contract>(address: string, name: string, signer?: string): Promise<C> {
  let contract = await getContractBase(address, name);
  if (signer) {
    const _signer = await impersonate(signer);
    contract = contract.connect(_signer);
  }
  return contract as C;
}
//#endregion

/* Other Utils */

export async function deploy(bytecode: string): Promise<string> {
  const [signer] = await ethers.getSigners();
  const tx = await signer.sendTransaction({ data: bytecode });
  const { contractAddress } = await tx.wait();
  return contractAddress;
}

//#region Uniswap
export function sortTokens(tokenA: string, tokenB: string): string[] {
  return tokenA.toLowerCase() < tokenB.toLowerCase()
    ? [tokenA, tokenB]
    : [tokenB, tokenA];
}

export function computeUniswapPairAddress(
  tokenA: string,
  tokenB: string
): string {
  const initCodeHash =
    "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
  const [token0, token1] = sortTokens(tokenA, tokenB);
  const salt = keccak256(
    Buffer.concat([
      Buffer.from(token0.slice(2).padStart(40, "0"), "hex"),
      Buffer.from(token1.slice(2).padStart(40, "0"), "hex"),
    ])
  );
  return getCreate2Address(addresses.UNISWAP_FACTORY_ADDRESS, salt, initCodeHash);
}
//#endregion Uniswap