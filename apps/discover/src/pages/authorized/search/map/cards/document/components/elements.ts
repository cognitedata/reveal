import styled from 'styled-components/macro';

import { Tooltip } from '@cognite/cogs.js';

import { FlexRow, FlexShrinkWrap, FlexColumn, sizes } from 'styles/layout';

const MetadataContainer = styled(FlexRow, FlexShrinkWrap)`
  padding-right: ${sizes.normal};
  margin-bottom: -${sizes.extraSmall};
`;

const MetadataItem = styled(FlexColumn)`
  width: 100%;
  margin-bottom: -${sizes.small};

  span {
    line-height: ${sizes.normal};
  }
`;

const ActionContainer = styled(FlexRow)`
  padding: ${sizes.normal};
  height: 68px;
`;

const FavouriteTooltip = styled(Tooltip)`
  margin-left: -${sizes.small};
`;

const DocumentInfoWrapper = styled.div`
  padding-top: ${sizes.normal};
  padding-bottom: ${sizes.medium};
`;

export {
  MetadataContainer,
  MetadataItem,
  ActionContainer,
  FavouriteTooltip,
  DocumentInfoWrapper,
};
