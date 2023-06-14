import { useEffect } from 'react';

import { Checkbox, Flex, Menu } from '@cognite/cogs.js';

import { Image360DatasetOptions } from '@data-exploration-app/containers/ThreeD/contexts/ThreeDContext';

import {
  StyledSecondaryObjectBody,
  StyledSecondaryObjectDetail,
  StyledSecondaryObjectMenuItemContent,
} from './SecondaryThreeDModelMenuItem';

export const Images360MenuItem = ({
  siteId,
  siteName,
  onChange,
  options,
  imageCount,
}: {
  siteId: string;
  siteName: string;
  imageCount: number;
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
    <StyledSecondaryObjectMenuItemContent gap={8}>
      <Checkbox
        checked={Boolean(options?.applied)}
        name={`site-${siteId}`}
        onChange={(_, checked) => handleClickModelMenuItem(!!checked)}
      />
      <Flex alignItems="flex-start" direction="column">
        <StyledSecondaryObjectBody $isSelected={options?.applied}>
          {siteName}
        </StyledSecondaryObjectBody>
        <StyledSecondaryObjectDetail>
          {imageCount + ' images'}
        </StyledSecondaryObjectDetail>
      </Flex>
    </StyledSecondaryObjectMenuItemContent>
  );

  return <Menu.Item hideTooltip={true}>{menuItemContent}</Menu.Item>;
};
