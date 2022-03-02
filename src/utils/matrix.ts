import { ExternalLabelDefinition } from '@cognite/sdk';

export interface ConfusionMatrix {
  id: number;
  name: string;
  matrix: {
    value: number;
    outlier: boolean;
  };
}

/**
 * Transmutes an 2d array of values with matching labels, and detects outliers
 * from the optimal diagonal confusion matrix line
 *
 * Simplified example of the transformation:
 * [[1, 0], [0, 2]] + ['a', 'b']
 * --->
 * [{ matrix: { a: 1, b: 0 } }, { matrix: { a: 0, b: 2 } }]
 *
 * @param confusionMatrix 2d of values from training
 * @param labels array of labels
 */
export const mapConfusionMatrix = (
  confusionMatrix: number[][],
  labels: ExternalLabelDefinition[]
): ConfusionMatrix[] => {
  return confusionMatrix.map((row, rowIndex) => {
    const matrix = row.reduce((accumulator, value, columnIndex) => {
      const isValueOutlier = value > 0 && columnIndex !== rowIndex;

      return {
        ...accumulator,
        [labels[columnIndex]?.externalId || '?']: {
          value,
          outlier: isValueOutlier,
        },
      };
    }, {} as ConfusionMatrix['matrix']);
    return { id: rowIndex, name: labels[rowIndex]?.name || '?', matrix };
  });
};
