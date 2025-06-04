import { SelectPanel } from '@cognite/cogs-lab';
import { type ModelHandler } from '../ModelHandler';
import { type ReactElement } from 'react';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';

export const ModelLayersList = ({
  modelLayerHandlers,
  update,
  label,
  disabled
}: {
  modelLayerHandlers: ModelHandler[];
  update: () => void;
  label?: string;
  disabled?: boolean;
}): ReactElement => {
  if (disabled === true) {
    return <></>;
  }

  return (
    <>
      {label !== undefined && (
        <SelectPanel.Section>
          <WholeLayerVisibilitySelectItem
            label={label}
            modelLayerHandlers={modelLayerHandlers}
            update={update}
          />
        </SelectPanel.Section>
      )}
      <SelectPanel.Section>
        {modelLayerHandlers.map((handler) => (
          <SelectPanel.Item
            key={handler.key()}
            label={handler.name}
            variant="checkbox"
            checked={handler.visible()}
            onClick={() => {
              handler.setVisibility(!handler.visible());
              update();
            }}
          />
        ))}
      </SelectPanel.Section>
    </>
  );
};
