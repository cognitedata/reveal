import React, { useState } from 'react';

import { Button, ToolBar, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from '../../common';
import PropertySelectorToolbarWrapper from '../../components/PropertySelector/PropertySelectorToolbarWrapper';
import { Property } from '../../components/PropertySelector/types';
import { setFilteredPropertiesByContainerConfigs } from '../../state/useIndustrialCanvasStore';
import { IndustryCanvasContainerConfig } from '../../types';
import { useTranslation } from '../useTranslation';

import { TooltipToolBarContainer } from './styles';

type MultiContainerTooltipProps = {
  selectedContainers: IndustryCanvasContainerConfig[];
};

const MultiContainerTooltip: React.FC<MultiContainerTooltipProps> = ({
  selectedContainers,
}) => {
  const { t } = useTranslation();
  const [isChangingProperties, setIsChangingProperties] = useState(false);

  const handleApplyClick = ({
    properties,
    shouldApplyToAll,
  }: {
    properties: Property[];
    shouldApplyToAll: boolean;
  }) => {
    setFilteredPropertiesByContainerConfigs({
      containerConfigs: selectedContainers,
      propertyPaths: properties.map((property) => property.path),
      shouldApplyToAll,
    });
    setIsChangingProperties(false);
  };

  return (
    <TooltipToolBarContainer>
      {isChangingProperties && (
        <PropertySelectorToolbarWrapper
          containerConfigs={selectedContainers}
          onApplyClick={handleApplyClick}
        />
      )}
      <ToolBar direction="horizontal">
        <>
          <Tooltip
            content={t(translationKeys.TOOLTIP_CHANGE_FIELDS, 'Change fields')}
          >
            <Button
              icon="ListAdd"
              onClick={() => setIsChangingProperties((prevState) => !prevState)}
              type="ghost"
              aria-label={t(
                translationKeys.TOOLTIP_CHANGE_FIELDS,
                'Change field'
              )}
            />
          </Tooltip>
        </>
      </ToolBar>
    </TooltipToolBarContainer>
  );
};

export default MultiContainerTooltip;
