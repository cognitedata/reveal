import { Body, Checkbox, Flex, Menu, Colors } from '@cognite/cogs.js';
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Image360DatasetOptions } from '@data-exploration-app/containers/ThreeD/ThreeDContext';

export const Images360MenuItem = ({
  siteId,
  siteName,
  onChange,
  options,
}: {
  siteId: string;
  siteName: string;
  onChange: (nextState: Image360DatasetOptions) => void;
  options?: Image360DatasetOptions;
}) => {
  useEffect(() => {
    if (!options) {
      onChange({
        siteId: siteId,
        siteName: siteName,
        applied: false,
      });
    }
  }, [onChange, options, siteId, siteName]);

  const handleClickModelMenuItem = (checked: boolean): void => {
    if (options) {
      onChange({
        ...options,
        applied: checked,
      });
    }
  };

  const menuItemContent = (
    <StyledMenuItemContent gap={8}>
      <Checkbox
        checked={!!options?.applied}
        name={`site-${siteId}`}
        onChange={(_, checked) => handleClickModelMenuItem(!!checked)}
      />
      <Flex alignItems="flex-start" direction="column">
        <StyledImages360Body $isSelected={options?.applied}>
          {siteName}
        </StyledImages360Body>
      </Flex>
    </StyledMenuItemContent>
  );

  return <Menu.Item css={{}}>{menuItemContent}</Menu.Item>;
};

export const StyledMenuItemContent = styled(Flex)`
  margin-right: 16px;
`;

export const StyledImages360Body = styled(Body).attrs({
  level: 2,
  strong: true,
})<{ $isSelected?: boolean }>`
  color: ${({ $isSelected }) =>
    $isSelected && Colors['text-icon--interactive--default']};
`;
