import { BigNumber } from "ethers";

export type ProposalTransaction = {
  to: string;
  calldata: string;
  signature: string;
  value?: BigNumber;
};

export type TestProposalTransaction = {
  to: string;
  data: string;
  value?: BigNumber;
};

export type ProposalArgs = {
  targets: string[];
  values: BigNumber[];
  signatures: string[];
  calldatas: string[];
  description: string;
}