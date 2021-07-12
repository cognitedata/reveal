import { Colors, Table } from '@cognite/cogs.js';
import { DataRangeFilter } from 'pages/DataTransfers/components/Table/filters/DataRangeFilter';
import { StatusDot } from 'pages/DataTransfers/elements';
import { DataTransfersTableData } from 'pages/DataTransfers/types';
import { getFormattedTimestampOrString } from 'pages/DataTransfers/utils';
import { Rule } from 'typings/interfaces';
import { apiStatuses } from 'utils/statuses';

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
      key: 'name',
      render: ({ value }: { value: any }) => {
        return getFormattedTimestampOrString(value);
      },
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
    },
    {
      key: 'report',
      render: ({ value }: { value: any }) => {
        return getFormattedTimestampOrString(value);
      },
      Filter: Table.SelectColumnFilter(),
      filter: 'includes',
    },
    {
      key: 'status',
      render: ({ value }: { value: any }) => {
        let color = Colors['greyscale-grey3'].hex();
        if (value === apiStatuses.Failed) {
          color = Colors.danger.hex();
        } else if (value === apiStatuses.Succeeded) {
          color = Colors.success.hex();
        } else if (value === apiStatuses.InProgress) {
          color = Colors.yellow.hex();
        }
        return <StatusDot bgColor={color} />;
      },
      width: 70,
    },
    {
      key: 'last_updated',
      render: ({ value }: { value: any }) => {
        return getFormattedTimestampOrString(value);
      },
      Filter: DataRangeFilter,
      filter: 'between',
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
          <DetailViewButton
            record={original}
            onDetailViewClick={handleDetailViewClick}
          />
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
