import { BigNumber } from 'ethers';
import { ProposalArgs, ProposalTransaction } from './types';

export * as Proposal12 from './12';

export function getProposalArgs(transactions: ProposalTransaction[], description: string): ProposalArgs {
  const {
    targets, values, signatures, calldatas
  } = transactions.reduce((prev, { to, value, signature, calldata }) => {
    prev.targets.push(to);
    prev.values.push(value || BigNumber.from(0));
    prev.signatures.push(signature);
    prev.calldatas.push(calldata);
    return prev;
  }, {
    targets: [] as string[],
    values: [] as BigNumber[],
    signatures: [] as string[],
    calldatas: [] as string[]
  });
  return {
    targets,
    values,
    signatures,
    calldatas,
    description
  };
}