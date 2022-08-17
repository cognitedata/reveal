import React from 'react';
import { Space, Divider } from 'antd';
import { ResourceItem } from '@cognite/data-exploration';
import DownloadButton from './DownloadButton';
import { PowerBIButton, GrafanaButton } from './CopyIdsButton';
import styled from 'styled-components';
import { DateFilter } from 'app/components/ResourceTitleRow';

type TitleRowActionsProps = {
  item: ResourceItem;
  beforeDefaultActions?: React.ReactNode;
  afterDefaultActions?: React.ReactNode;
  dateFilter?: DateFilter;
};

export const TitleRowActions = ({
  item,
  dateFilter,
  afterDefaultActions,
  beforeDefaultActions,
}: TitleRowActionsProps) => {
  if (item.type === 'threeD') {
    return <StyledSpace>{afterDefaultActions}</StyledSpace>;
  }
  return (
    <StyledSpace>
      <StyledDivider type="vertical" />
      {beforeDefaultActions}
      <DownloadButton item={item} dateFilter={dateFilter} />
      <PowerBIButton item={item} />
      <GrafanaButton item={item} />
      {afterDefaultActions}
    </StyledSpace>
  );
};

const StyledSpace = styled(Space)`
  float: right;
`;

const StyledDivider = styled(Divider)`
  height: 36px;
`;
