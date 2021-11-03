import { CogniteClient, Label } from '@cognite/sdk';
import {
  ClassifierTrainingSet,
  LabelCount,
  LabelDescription,
} from 'services/types';
import { fetchDocumentPipelines } from '../api';
import { composeLabelsCount, composeLabelsDescription } from './labels';

/**
 * Use for fetching the manage training set for classifier.
 *
 * API is stitched together with 3 independent calls to CDF:
 *    A) Label columns (fetches the external ids)
 *    B) Files in training sets (fetches the count)
 *    C) Description column (fetches the description)
 *
 * @docs https://docs.google.com/document/d/1d_HZufa3Z7NAe5qU3F1ZnihvOYoyGTbP9ysp7UA7pQQ#heading=h.au4cby5b5bk
 * @returns array of {@link ClassifierTrainingSet}
 */
export const composeClassifierTrainingSets = async (
  sdk: CogniteClient
): Promise<ClassifierTrainingSet[]> => {
  const { classifier } = await fetchDocumentPipelines(sdk); // Call "A"

  const labelCount = await composeLabelsCount(sdk, classifier?.trainingLabels); // Call "B"

  const labelDescription = await composeLabelsDescription(
    sdk,
    classifier?.trainingLabels
  ); // Call "C"

  return constructClassifierTrainingSets(
    classifier?.trainingLabels,
    labelCount,
    labelDescription
  );
};

const constructClassifierTrainingSets = (
  trainingLabels: Label[] | undefined,
  labelCount: LabelCount,
  labelDescription: LabelDescription
): ClassifierTrainingSet[] => {
  return (trainingLabels || []).map(({ externalId }) => ({
    id: externalId,
    label: externalId,
    count: labelCount[externalId],
    description: labelDescription[externalId],
  }));
};
