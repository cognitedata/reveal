import React from 'react';

import { Body, Colors, Detail, Flex, Icon } from '@cognite/cogs.js';
import moment from 'moment';
import styled from 'styled-components';

import Tooltip from 'components/Tooltip/Tooltip';

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
    <Wrapper alignItems="center" direction="column">
      <Tooltip
        content={moment(tableLastUpdatedTime).format(
          'DD/MM/YYYY hh:mm:ss A (Z)'
        )}
        delay={[300, 0]}
      >
        <StyledLastUpdatedTimeBody
          level={2}
          strong
          style={{ display: 'flex', alignItems: 'center' }}
        >
          Last updated: {moment(tableLastUpdatedTime).format('DD/MM/YYYY')}
        </StyledLastUpdatedTimeBody>
      </Tooltip>
      <Detail className="detail--last-update-info" strong>
        (Based on current displayed rows)
      </Detail>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  white-space: nowrap;
  margin-top: 18px;
  .detail--last-update-info {
    color: ${Colors['greyscale-grey6'].hex()};
  }
`;

const StyledLastUpdatedTimeBody = styled(Body)`
  white-space: nowrap;
`;

const StyledLastUpdatedTimeLoaderIcon = styled(Icon)`
  color: ${Colors['greyscale-grey4'].hex()};
  margin: 0 5px;
`;

export default TableLastUpdatedTime;
