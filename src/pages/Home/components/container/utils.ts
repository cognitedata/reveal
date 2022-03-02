import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';
import { TableCell } from 'components/table/TableCell';

export const metricsLabels = (classifier?: Classifier) => [
  {
    name: 'Build time',
    Value: TableCell.Date({ value: classifier?.createdAt } as any),
  },
  {
    name: 'Precision',
    Value: TableCell.Number({
      value: classifier?.metrics?.precision,
    } as any),
  },
  {
    name: 'Recall',
    Value: TableCell.Number({
      value: classifier?.metrics?.recall,
    } as any),
  },
  {
    name: 'F1 score',
    Value: TableCell.Number({
      value: classifier?.metrics?.f1Score,
    } as any),
  },
];
