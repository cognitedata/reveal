/*!
 * Copyright 2024 Cognite AS
 */
import { Button, Dropdown, type IconType, Tooltip } from '@cognite/cogs.js';
import { useReveal } from '../../RevealCanvas/ViewerContext';
import { type ModelHandler } from './ModelHandler';
import { ModelLayersList } from './ModelLayersList';
import { type ReactElement } from 'react';
import { type UpdateModelHandlersCallback } from './useModelHandlers';

export const ModelLayersButton = ({
  icon,
  label,
  handlers,
  update
}: {
  icon: IconType;
  label: string;
  handlers: ModelHandler[];
  update: UpdateModelHandlersCallback;
}): ReactElement => {
  const viewer = useReveal();

  return (
    <Tooltip content={label} placement="right" appendTo={document.body}>
      <Dropdown
        appendTo={viewer.domElement ?? document.body}
        content={<ModelLayersList modelHandlers={handlers} update={update} label={label} />}>
        <Button type="ghost" icon={icon} />
      </Dropdown>
    </Tooltip>
  );
};
