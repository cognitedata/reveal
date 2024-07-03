/*!
 * Copyright 2024 Cognite AS
 */
import { Button, Tooltip } from '@cognite/cogs.js';
import { Dropdown } from '@cognite/cogs-lab';
import { type ModelHandler } from './ModelHandler';
import { ModelLayersList } from './ModelLayersList';
import { type ReactElement } from 'react';
import { type UpdateModelHandlersCallback } from './useModelHandlers';
import { getIconComponent, type IconName } from '../../Architecture/getIconComponent';

export const ModelLayersButton = ({
  icon,
  label,
  handlers,
  update
}: {
  icon: IconName;
  label: string;
  handlers: ModelHandler[];
  update: UpdateModelHandlersCallback;
}): ReactElement => {
  const IconComponent = getIconComponent(icon);

  return (
    <Tooltip content={label} placement="right" appendTo={document.body}>
      <Dropdown
        content={<ModelLayersList modelHandlers={handlers} update={update} label={label} />}>
        <Button type="ghost" icon={<IconComponent />} />
      </Dropdown>
    </Tooltip>
  );
};
