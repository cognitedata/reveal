import chartAtom from 'models/charts/charts/atoms/atom';
import { Chart } from 'models/charts/charts/types/types';
import { selector } from 'recoil';
import { getUnitConvertedDatapointsSummary } from 'utils/units';
import { workflowsAtom } from '../atoms/atom';
import { WorkflowState } from '../types';

export const availableWorkflows = selector({
  key: 'availableWorkflows',
  get: ({ get }) => {
    const state = get(workflowsAtom);
    const workflowsAsArray = Object.values(state);
    return workflowsAsArray;
  },
});

export const calculationSummaries = selector({
  key: 'calculationSummaries',
  get: ({ get }) => {
    const calculationResults = Object.values(get(workflowsAtom));
    const chart = get(chartAtom);
    return getUnitConvertedCalculationSummaries(calculationResults, chart!);
  },
});

export function getUnitConvertedCalculationSummaries(
  calculationResults: WorkflowState[],
  chart: Chart
) {
  const convertedSummaries = calculationResults.reduce(
    (output, calculationResult) => {
      const correspondingCalculationDescription =
        chart?.workflowCollection?.find(
          (calculation) => calculation.id === calculationResult.id
        );
      const { unit, preferredUnit } = correspondingCalculationDescription || {};
      return {
        ...output,
        [calculationResult.id]: getUnitConvertedDatapointsSummary(
          calculationResult.datapoints,
          unit,
          preferredUnit
        ),
      };
    },
    {} as {
      [key: string]: ReturnType<typeof getUnitConvertedDatapointsSummary>;
    }
  );
  return convertedSummaries;
}
