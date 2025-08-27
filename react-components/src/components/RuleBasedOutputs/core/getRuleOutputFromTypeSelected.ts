import { type ColorRuleOutput, type RuleOutput } from '../types';

export const getRuleOutputFromTypeSelected = (
  outputs: RuleOutput[],
  outputType: string
): ColorRuleOutput | undefined => {
  const outputFound = outputs.find((output: { type: string }) => output.type === outputType);

  if (outputFound?.type !== 'color') return;

  const outputSelected: ColorRuleOutput = {
    externalId: outputFound.externalId,
    type: 'color',
    fill: outputFound.fill,
    outline: outputFound.outline
  };

  return outputSelected;
};
