import { Body, Detail, Flex, formatDateTime, Label } from '@cognite/cogs.js';
import { HeartbeatsOutages } from 'pages/Status/types';

export const curateColumns = () => {
  return [
    {
      Header: 'Date and Range',
      accessor: 'outage',
      Cell: ({
        row: {
          original: {
            outage: [start, end],
          },
        },
      }: {
        row: { original: HeartbeatsOutages };
      }) => {
        return (
          <Flex direction="column" gap={4}>
            <Body level={2}>{formatDateTime(start)} -</Body>
            <Body level={2}>{formatDateTime(end)}</Body>
          </Flex>
        );
      },
    },
    {
      Header: 'Connector',
      accessor: 'connector',
      Cell: ({
        row: {
          original: { connector },
        },
      }: {
        row: { original: HeartbeatsOutages };
      }) => {
        return (
          <Flex direction="column" gap={4}>
            <Body level={2}>{connector.source}</Body>
            <Detail>{connector.instance}</Detail>
          </Flex>
        );
      },
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: () => <Label variant="danger">Temporarily down</Label>,
    },
  ];
};
