import { Table, Label, LabelVariants, Tag, Tooltip } from '@cognite/cogs.js';
import { DataRangeFilter } from 'pages/DataTransfers/components/Table/filters/DataRangeFilter';
import { DataTransfersTableData } from 'pages/DataTransfers/types';
import { getFormattedTimestampOrString } from 'pages/DataTransfers/utils';
import { getLatestRevisionStepsStatus } from 'services/endpoints/datatransfers/selector';
import { Status } from 'types/ApiInterface';
import { Rule } from 'typings/interfaces';
import { formatDate } from 'utils/date';

import { DetailViewButton } from '../../components/DetailView/DetailViewButton';

interface Props {
  handleDetailViewClick: (record: DataTransfersTableData) => void;
}

/**
 * Defines custom render to specific record keys (or fallback to wildcard).
 * Following function is used in conjunction with {@link curateDataTransfersColumns}
 *
 * @param handleDetailViewClick callback to button click of detail view button
 */
export const dataTransfersColumnRules = ({
  handleDetailViewClick,
}: Props): Rule[] => {
  return [
    {
      key: ['source.name', 'target.name'],
      render: ({ value }: { value: any }) => {
        return getFormattedTimestampOrString(value);
      },
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
      filterIcon: 'Search',
    },
    {
      key: 'status',
      render: ({
        value,
        cell: {
          row: { original },
        },
      }: {
        value: Status;
        cell: { row: { original: DataTransfersTableData } };
      }) => {
        const mapper: {
          [x in Status]: LabelVariants;
        } = {
          'In progress': 'normal',
          Succeeded: 'success',
          Failed: 'danger',
        };

        const [latestStep, steps] = getLatestRevisionStepsStatus(original);

        const message = latestStep.error_message || latestStep.status;
        const date = formatDate(latestStep.created_time);

        const tooltipText = `[Step ${steps}]: ${message} (${date})`;

        return (
          <Tooltip content={tooltipText}>
            <Label variant={mapper[value]}>{value}</Label>
          </Tooltip>
        );
      },
      width: 100,
      Filter: Table.CheckboxColumnFilter(),
      filter: 'arrayContains',
    },
    {
      key: ['source.last_updated', 'target.last_updated'],
      render: ({ value }: { value: any }) => {
        return getFormattedTimestampOrString(value);
      },
      Filter: DataRangeFilter,
      filter: 'between',
      filterIcon: 'Calendar',
    },
    {
      key: 'source.datatype',
      render: ({ value }: { value: string }) => {
        return <Tag>{value}</Tag>;
      },
    },
    {
      key: 'detailViewButton',
      width: 150,
      render: ({
        cell: {
          row: { original },
        },
      }: {
        cell: { row: { original: DataTransfersTableData } };
      }) => {
        return (
          <DetailViewButton record={original} onClick={handleDetailViewClick} />
        );
      },
    },
    // This wildcard key has to be in the end of the array - insert any new keys above this line!
    {
      key: '*',
      render: ({ value }: { value: any }) => {
        return getFormattedTimestampOrString(value);
      },
    },
  ];
};
