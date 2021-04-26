import { IGovernorAlpha } from '../typechain/IGovernorAlpha';

import { Proposal12, getProposalArgs } from '../proposals';
import { addresses, getContract } from '../utils';
import { formatEther } from '@ethersproject/units';

const {
  targets,
  values,
  signatures,
  calldatas,
  description
} = getProposalArgs(Proposal12.ProposalTransactions, Proposal12.description);

async function submitProposal() {
  const governorAlpha: IGovernorAlpha = await getContract(addresses.GovernorAlpha, 'IGovernorAlpha');
  console.log(`Submitting transaction...`);
  const tx = await governorAlpha.propose(
    targets,
    values,
    signatures,
    calldatas,
    description
  );
  console.log(`Submitted transaction, waiting for receipt...`);
  await tx.wait().then((receipt) => {
    console.log(`Transaction confirmed - executed in block ${receipt.blockNumber}`);
    console.log(`Gas Fee: ${formatEther(tx.gasLimit.mul(tx.gasPrice))} ETH`)
  }).catch((err) => {
    console.log(`Transaction execution reverted with error:`);
    console.log(err.message);
  });
}

submitProposal()
  .then(process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });