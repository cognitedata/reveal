/*!
 * Copyright 2025 Cognite AS
 */

import { SelectPanel } from '@cognite/cogs-lab';
import { IconWrapper, ChevronRightSmallIcon } from '@cognite/cogs.js';
import { type ReactElement, useCallback } from 'react';
import { type ModelHandler } from '../ModelHandler';
import { ModelLayersList } from './ModelLayersList';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';

type UpdateCallback = () => void;

type ModelLayerSelectionProps = {
  label: string;
  modelLayerHandlers: ModelHandler[];
  update: UpdateCallback;
};

export const ModelLayerSelection = ({
  label,
  modelLayerHandlers,
  update
}: ModelLayerSelectionProps): ReactElement => {
  const isDisabled = modelLayerHandlers.length === 0;

  const updateCallback = useCallback(() => {
    update();
  }, [update]);

  return (
    <SelectPanel
      placement="right"
      appendTo={'parent'}
      hideOnOutsideClick={true}
      openOnHover={!isDisabled}>
      <SelectPanel.Trigger>
        <WholeLayerVisibilitySelectItem
          label={label}
          modelLayerHandlers={modelLayerHandlers}
          update={updateCallback}
          trailingContent={
            <IconWrapper size={16}>
              <ChevronRightSmallIcon />
            </IconWrapper>
          }
          disabled={isDisabled}
        />
      </SelectPanel.Trigger>
      <SelectPanel.Body>
        <ModelLayersList
          modelLayerHandlers={modelLayerHandlers}
          update={updateCallback}
          disabled={isDisabled}
        />
      </SelectPanel.Body>
    </SelectPanel>
  );
};
