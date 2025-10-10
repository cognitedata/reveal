import { SelectPanel } from '@cognite/cogs-lab';
import { IconWrapper, ChevronRightSmallIcon } from '@cognite/cogs.js';
import { type ReactElement, useCallback } from 'react';
import { type ModelHandler } from '../ModelHandler';
import { ModelLayersList } from './ModelLayersList';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { useHoverHandlers } from '../hooks/useHoverHandlers';

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
  const { hoverHandlers, isPanelOpen, setPanelToClose } = useHoverHandlers(isDisabled);

  const updateCallback = useCallback(() => {
    update();
  }, [update]);

  return (
    <SelectPanel
      placement="right"
      hideOnOutsideClick={true}
      openOnHover={false}
      visible={isPanelOpen}
      onHide={setPanelToClose}>
      <SelectPanel.Trigger>
        <div {...hoverHandlers}>
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
        </div>
      </SelectPanel.Trigger>
      <SelectPanel.Body {...hoverHandlers}>
        <ModelLayersList
          modelLayerHandlers={modelLayerHandlers}
          update={updateCallback}
          disabled={isDisabled}
        />
      </SelectPanel.Body>
    </SelectPanel>
  );
};
