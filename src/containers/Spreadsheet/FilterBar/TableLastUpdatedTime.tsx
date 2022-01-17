import React from 'react';

import { Body, Colors, Icon, Tooltip } from '@cognite/cogs.js';
import moment from 'moment';
import styled from 'styled-components';

type TableLastUpdatedTimeProps = {
  isTableLastUpdatedTimeFetched?: boolean;
  tableLastUpdatedTime?: Date;
};

const TableLastUpdatedTime = ({
  isTableLastUpdatedTimeFetched,
  tableLastUpdatedTime,
}: TableLastUpdatedTimeProps): JSX.Element => {
  if (!isTableLastUpdatedTimeFetched) {
    <StyledLastUpdatedTimeLoaderIcon type="Loader" />;
  }

  if (!tableLastUpdatedTime) {
    return <></>;
  }

  return (
    <Tooltip
      content={moment(tableLastUpdatedTime).format('DD/MM/YYYY hh:mm:ss A (Z)')}
    >
      <StyledLastUpdatedTimeBody
        level={2}
        strong
        style={{ display: 'flex', alignItems: 'center' }}
      >
        Last updated time: {moment(tableLastUpdatedTime).format('DD/MM/YYYY')}
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
