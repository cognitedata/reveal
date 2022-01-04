/* eslint-disable no-nested-ternary */
import { Detail, Flex, Label, Title } from '@cognite/cogs.js';
import { HeartbeatsConnector } from 'pages/Status/types';
import { HeartbeatsReportResponse } from 'types/ApiInterface';

export const StatusHeader: React.FC<
  HeartbeatsConnector &
    Partial<Pick<HeartbeatsReportResponse, 'online'>> & {
      loading?: boolean;
      error?: boolean;
    }
> = ({ source, instance, online, loading, error }) => {
  return (
    <>
      <Flex justifyContent="space-between">
        <Title level={5}>{source}</Title>
        <Label
          size="small"
          variant={error || loading ? 'unknown' : online ? 'success' : 'danger'}
        >
          {loading
            ? 'Loading...'
            : error
            ? 'Unavailable'
            : online
            ? 'Currently operating'
            : 'Down'}
        </Label>
      </Flex>
      <Detail>{instance}</Detail>
    </>
  );
};
