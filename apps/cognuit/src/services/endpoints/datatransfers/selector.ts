import { DataTransfersTableData } from 'pages/DataTransfers/types';
import { Step } from 'types/ApiInterface';

export const getLatestRevisionStepsStatus = (
  record: DataTransfersTableData
): [Step, number] => {
  const { revisions = [] } = record?.source;
  const [revision] = revisions.reverse();

  const translation =
    revision.translations &&
    revision.translations[revision.translations.length - 1];

  const { steps = [] } = translation?.revision || {};

  return [steps[steps.length - 1], steps.length];
};
