/*!
 * Copyright 2024 Cognite AS
 */

import { Button } from '@cognite/cogs.js';
import { SelectPanel } from '@cognite/cogs-lab';
import { type ModelHandler } from './ModelHandler';
import { type ReactElement } from 'react';
import { IconComponent } from '../../Architecture/IconComponentMapper';
import { type IconName } from '../../../architecture/base/utilities/IconName';
import { ModelLayersList } from './ModelLayersList';

export const ModelLayersButton = ({
  icon,
  label,
  handlers,
  update
}: {
  icon: IconName;
  label: string;
  handlers: ModelHandler[];
  update: () => void;
}): ReactElement => {
  return (
    <SelectPanel placement="bottom" hideOnOutsideClick={true}>
      <SelectPanel.Trigger>
        <Button type="ghost" icon={<IconComponent iconName={icon} />} />
      </SelectPanel.Trigger>
      <SelectPanel.Body>
        <ModelLayersList modelLayerHandlers={handlers} update={update} label={label} />
      </SelectPanel.Body>
    </SelectPanel>
  );
};
