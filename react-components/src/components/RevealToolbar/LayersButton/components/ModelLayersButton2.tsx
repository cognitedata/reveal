import { Button } from '@cognite/cogs.js';
import { SelectPanel } from '@cognite/cogs-lab';
import { type ReactElement } from 'react';
import { IconComponent } from '../../../Architecture/Factories/IconFactory';
import { type IconName } from '../../../../architecture/base/utilities/types';
import { ModelLayersList } from './ModelLayersList2';
import { type RevealDomainObject, type RevealRenderTarget } from '../../../../architecture';

export const ModelLayersButton = ({
  icon,
  label,
  domainObjects,
  renderTarget
}: {
  icon: IconName;
  label: string;
  domainObjects: RevealDomainObject[];
  renderTarget: RevealRenderTarget;
}): ReactElement => {
  return (
    <SelectPanel placement="bottom" hideOnOutsideClick={true}>
      <SelectPanel.Trigger>
        <Button type="ghost" icon={<IconComponent iconName={icon} />} />
      </SelectPanel.Trigger>
      <SelectPanel.Body>
        <ModelLayersList domainObjects={domainObjects} label={label} renderTarget={renderTarget} />
      </SelectPanel.Body>
    </SelectPanel>
  );
};
