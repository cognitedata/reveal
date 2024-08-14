/*!
 * Copyright 2024 Cognite AS
 */
import { Checkbox, CounterChip, Flex } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { type ChangeEvent, useCallback, useMemo, type ReactElement, type MouseEvent } from 'react';
import { StyledLabel } from './elements';
import { type UpdateModelHandlersCallback } from './useModelHandlers';
import { useReveal } from '../../RevealCanvas/ViewerContext';

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
    <Flex direction="row" justifyContent="space-between" gap={4} onClick={handleToggleAllClick}>
      <Checkbox
        checked={someVisible}
        indeterminate={indeterminate}
        onChange={handleToggleAllClick}
      />
      <StyledLabel> {label} </StyledLabel>
      <CounterChip counter={modelHandlers.length} />
    </Flex>
  );
};
