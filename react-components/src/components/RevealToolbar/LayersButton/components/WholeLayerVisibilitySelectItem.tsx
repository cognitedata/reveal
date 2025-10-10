import { type ReactElement, type ReactNode } from 'react';
import { type ModelHandler } from '../ModelHandler';
import { SelectPanel } from '@cognite/cogs-lab';
import { CounterChip } from '@cognite/cogs.js';

export const WholeLayerVisibilitySelectItem = ({
  label,
  trailingContent,
  modelLayerHandlers,
  update,
  disabled,
  shouldPropagate = true
}: {
  label?: string;
  modelLayerHandlers: ModelHandler[];
  update: () => void;
  trailingContent?: ReactNode;
  disabled?: boolean;
  shouldPropagate?: boolean;
}): ReactElement => {
  const checked = modelLayerHandlers.some((handler) => handler.visible());
  return (
    <SelectPanel.Item
      variant="checkbox"
      label={label}
      checked={checked}
      disabled={disabled}
      onClick={(e) => {
        if (!shouldPropagate) {
          e.stopPropagation();
        }
        modelLayerHandlers.forEach((handler) => {
          handler.setVisibility(!checked);
        });
        update();
      }}
      trailingContent={
        <>
          <CounterChip counter={modelLayerHandlers.length} />
          {trailingContent}
        </>
      }
      size="medium"
    />
  );
};
