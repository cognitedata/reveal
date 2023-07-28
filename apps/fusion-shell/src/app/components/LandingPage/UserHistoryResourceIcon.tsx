import React from 'react';

import styled from 'styled-components';

import { Colors, Icon } from '@cognite/cogs.js';

import { colors } from '../../sections/colors';
import { RawAppItem } from '../../types';

type UserHistoryResourceIconProps = {
  app: RawAppItem | undefined;
};

export const CDF_APPS_CATEGORY_COLOR = {
  integrate: colors.lightBlue,
  contextualize: colors.orange,
  explore: colors.purple,
  configure: colors.blue,
} as const;

const UserHistoryResourceIcon = ({
  app,
}: UserHistoryResourceIconProps): JSX.Element => {
  const appCategory = app?.category;
  const appIcon = app?.icon || 'Grid';

  return (
    <StyledAppResourceIconContainer
      $backgroundColor={
        CDF_APPS_CATEGORY_COLOR[
          appCategory as keyof typeof CDF_APPS_CATEGORY_COLOR
        ]?.secondary
      }
    >
      <Icon type={appIcon} />
    </StyledAppResourceIconContainer>
  );
};

export const StyledAppResourceIconContainer = styled.div<{
  $backgroundColor: string;
}>`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px;
  gap: 10px;

  width: 36px;
  height: 36px;

  background-color: ${({ $backgroundColor }) => $backgroundColor};
  color: ${Colors['text-icon--on-contrast--strong--inverted']};
  border-radius: 6px;
`;

export default UserHistoryResourceIcon;
