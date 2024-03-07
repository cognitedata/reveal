import { Menu } from '@cognite/cogs.js';
import { ModelHandler } from './ModelHandler';
import { ChangeEvent, useCallback, useMemo } from 'react';

export const WholeLayerVisibilityToggle = ({
  modelHandlers,
  label,
  update
}: {
  modelHandlers: ModelHandler[];
  label: string;
  update: () => void;
}) => {
  const allVisible = useMemo(
    () => modelHandlers.every((handler) => handler.visible()),
    [modelHandlers]
  );

  const indeterminate = useMemo(
    () =>
      modelHandlers.some((handler) => handler.visible()) &&
      modelHandlers.some((handler) => !handler.visible()),
    [modelHandlers]
  );

  const toggleAll = useCallback(() => {
    modelHandlers.forEach((handler) => {
      handler.setVisibility(!allVisible);
      update();
    });
  }, [modelHandlers, allVisible]);

  return (
    <>
      <Menu.Item
        hasCheckbox
        checkboxProps={{
          checked: allVisible,
          indeterminate,
          onChange: (e: ChangeEvent) => {
            e.stopPropagation();
            toggleAll();
          }
        }}>
        {label}
      </Menu.Item>
    </>
  );
};
