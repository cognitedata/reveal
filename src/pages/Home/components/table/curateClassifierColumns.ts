import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { TableCell } from 'components/table/TableCell';

export type ClassifierActions = (
  event: 'delete' | 'confusion_matrix',
  classifier: Classifier
) => void;

export const curateColumns = (
  classifierActionsCallback?: ClassifierActions
) => {
  return [
    {
      Header: 'Build time',
      accessor: 'createdAt',
      Cell: TableCell.Date,
    },
    {
      Header: 'Labels',
      accessor: 'metrics.labels.length',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Files in training sets',
      accessor: 'trainingSetSize',
      Cell: TableCell.DocumentTag({ disableTooltip: true }),
    },
    {
      Header: 'Accuracy',
      accessor: 'metrics.recall',
      Cell: TableCell.Number,
    },
    {
      Header: 'F1 score',
      accessor: 'metrics.f1Score',
      Cell: TableCell.Number,
    },
    {
      Header: 'Precision',
      accessor: 'metrics.precision',
      Cell: TableCell.Number,
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: TableCell.ClassifierStatusLabel,
    },
    classifierActionsCallback && {
      Header: '',
      accessor: 'classifierActions',
      Cell: TableCell.ClassifierActions(classifierActionsCallback),
    },
  ].filter(Boolean);
};
