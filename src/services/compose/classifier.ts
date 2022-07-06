import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { CogniteClient } from '@cognite/sdk';
import { ClassifierTrainingSet } from 'src/services/types';
import {
  fetchDocumentClassifierById,
  fetchDocumentPipelines,
  fetchLabels,
} from '../api';
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
  const labels = await fetchLabels(sdk);

  const labelName = (externalId: string) =>
    labels.find((label) => label.externalId === externalId)?.name || externalId;

  const labelCount = await composeLabelsCount(sdk, classifier?.trainingLabels); // Call "B"

  const labelDescription = await composeLabelsDescription(
    labels,
    classifier?.trainingLabels
  ); // Call "C"

  // Construct all together into training sets
  return (classifier?.trainingLabels || []).map(({ externalId }) => ({
    id: externalId,
    label: labelName(externalId),
    count: labelCount[externalId],
    description: labelDescription[externalId],
  }));
};

/**
 * Use for fetching the active classifier model
 *
 * API is stitched together with 2 independent calls to CDF:
 *    A) Pipelines
 *    B) Document classifier by id (referenced from pipeline)
 *
 * @returns {@link DocumentClassifier}
 */
export const composeActiveClassifier = async (
  sdk: CogniteClient
): Promise<Classifier | undefined> => {
  const { classifier } = await fetchDocumentPipelines(sdk); // Call "A"

  const activeClassifierId = classifier?.activeClassifierId;
  if (!activeClassifierId) {
    return undefined;
  }

  return await fetchDocumentClassifierById(sdk, activeClassifierId); // Call "B"
};
