/*!
 * Copyright 2024 Cognite AS
 */
import { Checkbox, Flex } from '@cognite/cogs.js';
import { type ModelHandler } from './ModelHandler';
import { type ChangeEvent, useCallback, useMemo, type ReactElement, type MouseEvent } from 'react';
import { StyledChipCount, StyledLabel } from '../../RevealToolbar/LayersContainer/elements';

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

  const handleToggleAllClick = useCallback(
    (e: ChangeEvent | MouseEvent) => {
      e.stopPropagation();
      modelHandlers.forEach((handler) => {
        handler.setVisibility(!someVisible);
        update();
      });
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
      <StyledChipCount label={String(modelHandlers.length)} hideTooltip type="neutral" />
    </Flex>
  );
};
