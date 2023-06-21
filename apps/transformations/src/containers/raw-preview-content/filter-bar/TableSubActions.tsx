import styled from 'styled-components';

import { useTranslation } from '@transformations/common/i18n';
import Separator from '@transformations/components/separator';
import Tooltip from '@transformations/components/tooltip';
import { Typography } from 'antd';
import moment from 'moment';

import { Body, Colors, Icon, Flex } from '@cognite/cogs.js';

import RowCount from './RowCount';

const { Text } = Typography;

type TableSubActionsProps = {
  isTableLastUpdatedTimeFetched?: boolean;
  tableLastUpdatedTime?: Date;
  database: string;
  table: string;
};

const TableSubActions = ({
  isTableLastUpdatedTimeFetched,
  tableLastUpdatedTime,
  database,
  table,
}: TableSubActionsProps): JSX.Element => {
  const { t } = useTranslation();

  if (!isTableLastUpdatedTimeFetched) {
    <StyledLastUpdatedTimeLoaderIcon type="Loader" />;
  }

  if (!tableLastUpdatedTime) {
    return <></>;
  }

  return (
    <Flex justifyContent="center" alignItems="center">
      <Tooltip
        content={moment(tableLastUpdatedTime).format(
          'DD/MM/YYYY hh:mm:ss A (Z)'
        )}
      >
        <StyledLastUpdatedTimeBody
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {t('last-updated-time')}&nbsp;:&nbsp;
          <strong>{moment(tableLastUpdatedTime).format('DD/MM/YYYY')}</strong>
        </StyledLastUpdatedTimeBody>
      </Tooltip>
      <Separator style={{ margin: '0 12px' }} />
      <Body level={2} strong style={{ display: 'flex', alignItems: 'center' }}>
        <RowCount database={database} table={table} />
      </Body>
      <Separator style={{ margin: '0 12px' }} />
    </Flex>
  );
};

const StyledLastUpdatedTimeBody = styled(Text)`
  white-space: nowrap;
`;

const StyledLastUpdatedTimeLoaderIcon = styled(Icon)`
  color: ${Colors['decorative--grayscale--400']};
  margin: 0 5px;
`;

export default TableSubActions;
