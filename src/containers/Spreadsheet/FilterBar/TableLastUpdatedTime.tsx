import React from 'react';

import { Body, Colors, Icon } from '@cognite/cogs.js';
import moment from 'moment';
import styled from 'styled-components';

import Tooltip from 'components/Tooltip/Tooltip';
import { useTranslation } from 'common/i18n';

type TableLastUpdatedTimeProps = {
  isTableLastUpdatedTimeFetched?: boolean;
  tableLastUpdatedTime?: Date;
};

const TableLastUpdatedTime = ({
  isTableLastUpdatedTimeFetched,
  tableLastUpdatedTime,
}: TableLastUpdatedTimeProps): JSX.Element => {
  const { t } = useTranslation();

  if (!isTableLastUpdatedTimeFetched) {
    <StyledLastUpdatedTimeLoaderIcon type="Loader" />;
  }

  if (!tableLastUpdatedTime) {
    return <></>;
  }

  return (
    <Tooltip
      content={moment(tableLastUpdatedTime).format('DD/MM/YYYY hh:mm:ss A (Z)')}
      delay={[300, 0]}
    >
      <StyledLastUpdatedTimeBody
        level={2}
        strong
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {t('last-updated-time', {
          time: moment(tableLastUpdatedTime).format('DD/MM/YYYY'),
        })}
      </StyledLastUpdatedTimeBody>
    </Tooltip>
  );
};

const StyledLastUpdatedTimeBody = styled(Body)`
  white-space: nowrap;
`;

const StyledLastUpdatedTimeLoaderIcon = styled(Icon)`
  color: ${Colors['greyscale-grey4'].hex()};
  margin: 0 5px;
`;

export default TableLastUpdatedTime;
