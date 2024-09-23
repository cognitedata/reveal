/*!
 * Copyright 2024 Cognite AS
 */
import { CounterChip } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { type ChangeEvent, useCallback, useMemo, type ReactElement, type MouseEvent } from 'react';
import { type UpdateModelHandlersCallback } from './useModelHandlers';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { Menu } from '@cognite/cogs-lab';

export const WholeLayerVisibilityToggle = ({
  modelHandlers,
  label,
  update
}: {
  modelHandlers: ModelHandler[];
  label: string;
  update: UpdateModelHandlersCallback;
}): ReactElement => {
  const viewer = useReveal();

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

  const handleToggleAllClick = useCallback(
    (e: ChangeEvent | MouseEvent) => {
      e.stopPropagation();
      modelHandlers.forEach((handler) => {
        handler.setVisibility(!someVisible);
      });
      update(viewer.models, viewer.get360ImageCollections());
    },
    [modelHandlers, someVisible]
  );

  return (
    <Menu.ItemToggled label={label} onClick={handleToggleAllClick}>
      <CounterChip counter={modelHandlers.length} />
    </Menu.ItemToggled>
  );
};
