import { keccak256 } from "@ethersproject/keccak256";

export const sha3 = (value: string) => keccak256(Buffer.from(value));

export const implementationHashes = {
  SigmaPoolImplementationID: sha3('SigmaIndexPoolV1.sol'),
  IndexPoolImplementationID: sha3('IndexPool.sol')
};