/*!
 * Copyright 2024 Cognite AS
 */
import { Menu } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { type ChangeEvent, useCallback, useMemo, type ReactElement } from 'react';

export const WholeLayerVisibilityToggle = ({
  modelHandlers,
  label,
  update
}: {
  modelHandlers: ModelHandler[];
  label: string;
  update: () => void;
}): ReactElement => {
  const someVisible = useMemo(
    () => modelHandlers.some((handler) => handler.visible()),
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
      handler.setVisibility(!someVisible);
      update();
    });
  }, [modelHandlers, someVisible]);

  return (
    <>
      <Menu.Item
        hasCheckbox
        checkboxProps={{
          checked: someVisible,
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
