import { useEffect } from 'react';

import { Checkbox, Flex, Menu } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

import { PointsOfInterestCollection, PointOfInterest } from '../../hooks';

import {
  StyledSecondaryObjectBody,
  StyledSecondaryObjectDetail,
  StyledSecondaryObjectMenuItemContent,
} from './SecondaryThreeDModelMenuItem';

export const PointsOfInterestMenuItem = ({
  externalId,
  title,
  description,
  pointsOfInterest,
  onChange,
  pointsOfInterestCollection,
}: {
  externalId: string;
  title?: string;
  description?: string;
  pointsOfInterest?: PointOfInterest[];
  onChange: (item: PointsOfInterestCollection) => void;
  pointsOfInterestCollection?: PointsOfInterestCollection;
}) => {
  const { t } = useTranslation();
  useEffect(() => {
    if (!pointsOfInterestCollection) {
      onChange({
        externalId,
        applied: false,
        title: title,
        description: description,
        pointsOfInterest: pointsOfInterest,
      });
    }
  }, [
    onChange,
    pointsOfInterestCollection,
    externalId,
    title,
    description,
    pointsOfInterest,
  ]);

  const handleClickModelMenuItem = (checked: boolean): void => {
    if (pointsOfInterestCollection) {
      onChange({
        ...pointsOfInterestCollection,
        applied: checked,
      });
    }
  };

  const menuItemContent = (
    <StyledSecondaryObjectMenuItemContent gap={8}>
      <Checkbox
        checked={Boolean(pointsOfInterestCollection?.applied)}
        name={title ?? t('NO_TITLE', 'No title')}
        onChange={(_, checked) => handleClickModelMenuItem(!!checked)}
      />
      <Flex alignItems="flex-start" direction="column">
        <StyledSecondaryObjectBody
          $isSelected={pointsOfInterestCollection?.applied}
        >
          {title}
        </StyledSecondaryObjectBody>
        <StyledSecondaryObjectDetail>
          {t('POINTS_OF_INTEREST_WITH_COUNT', '{{count}} points of interest', {
            count: pointsOfInterest?.length,
          })}
        </StyledSecondaryObjectDetail>
      </Flex>
    </StyledSecondaryObjectMenuItemContent>
  );

  return <Menu.Item hideTooltip={true}>{menuItemContent}</Menu.Item>;
};
