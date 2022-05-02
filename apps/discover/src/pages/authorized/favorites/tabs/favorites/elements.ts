import styled from 'styled-components/macro';

import { Icon, Label, Menu } from '@cognite/cogs.js';

import { Card } from 'components/Card';
import InlineLink from 'components/InlineLink';
import { FlexAlignItems, FlexColumn, FlexRow, sizes } from 'styles/layout';

export const ToggleContainer = styled.div`
  margin-right: 38px;

  & .cogs-switch {
    align-items: center;
    flex-direction: row-reverse;
  }

  & .switch-ui {
    margin-right: 0;
  }
`;

export const ToggleLabel = styled.div`
  font-size: 12px;
  white-space: nowrap;
`;

export const SummaryWrapper = styled(FlexColumn)`
  margin-top: ${sizes.medium};
  margin-bottom: ${sizes.medium};
  align-items: flex-start;

  width: 100%;
`;

export const MetadataWrapper = styled(FlexColumn)`
  margin-top: ${sizes.normal};
  margin-bottom: ${sizes.normal};
`;

export const FilePathWrapper = styled(FlexColumn)`
  margin-bottom: ${sizes.normal};
`;
export const StyledInlineLink = styled(InlineLink)`
  text-decoration: underline;
  margin-bottom: ${sizes.small};
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const FilePathContainer = styled.div`
  max-width: 80%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: ${sizes.small};
`;

export const P = styled.span`
  max-width: 80%;
  margin-top: 0;
  padding-top: 0;
  margin-bottom: ${sizes.small};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* number of lines to show */
  -webkit-box-orient: vertical;
`;

export const TabBar = styled.div`
  margin-top: ${sizes.large};
  padding-left: ${sizes.extraLarge};
  border-bottom: 1px solid var(--cogs-border-default);
  height: ${sizes.extraLarge};
`;

export const TabContent = styled.div`
  white-space: nowrap;
`;

export const StyledCard = styled(Card)`
  width: 100%;
  min-height: 258px;
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px ${sizes.small} rgba(0, 0, 0, 0.06);

  transition: box-shadow var(--cogs-transition-time-fast);

  &:hover {
    box-shadow: 0px ${sizes.small} ${sizes.normal} ${sizes.extraSmall}
        rgba(0, 0, 0, 0.08),
      0px 2px 10px rgba(0, 0, 0, 0.06);
  }
  border-radius: ${sizes.small};
`;

export const ContentRow = styled(FlexColumn)`
  padding: ${sizes.normal} 0 0 0;
`;

export const LabelHeader = styled(FlexAlignItems)`
  font-size: 14px;
  min-width: 100px;
  height: 20px;
  font-weight: 500;
  align-items: flex-start;
  color: var(--cogs-text-primary);
  position: relative;
  margin-bottom: ${sizes.extraSmall};
`;

export const LabelDescription = styled(FlexAlignItems)`
  font-size: 14px;
  min-width: 100px;
  font-weight: 500;
  color: var(--cogs-text-primary);
`;

export const Value = styled(FlexAlignItems)`
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: var(--cogs-text-primary);
`;

export const AssetIcon = styled(Icon)`
  color: var(--cogs-greyscale-grey7);
  margin-right: 6px;
`;

export const SubLabel = styled(Label)`
  margin-right: ${sizes.small};
  cursor: pointer;
`;

export const Container = styled.div`
  width: 100%;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
  grid-auto-rows: minmax(100px, auto);
  gap: ${sizes.large};
  height: auto;
  justify-items: center;
`;

export const ActionPadding = styled(FlexRow)`
  margin-right: ${sizes.small};
`;

export const DropDownMenu = styled(Menu)`
  width: 172px;
`;

export const DescriptionField = styled.div`
  .cogs-input {
    pointer-events: none;
    background: var(--cogs-bg-control--secondary) !important;
    text-overflow: ellipsis;
  }
  margin-bottom: ${sizes.normal};
`;
