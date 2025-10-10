import { Button } from '@cognite/cogs.js';
import { SelectPanel } from '@cognite/cogs-lab';
import { type ModelHandler } from '../ModelHandler';
import { type ReactElement } from 'react';
import { IconComponent } from '../../../Architecture/Factories/IconFactory';
import { type IconName } from '../../../../architecture/base/utilities/types';
import { ModelLayersList } from './ModelLayersList';
import { RevealDomainObject, RevealRenderTarget } from '../../../../architecture';

export const ModelLayersButton = ({
  icon,
  label,
  domainObjects,
  // update,
  renderTarget
}: {
  icon: IconName;
  label: string;
  domainObjects: RevealDomainObject[];
  // update: () => void;
  renderTarget: RevealRenderTarget;
}): ReactElement => {
  return (
    <SelectPanel placement="bottom" hideOnOutsideClick={true}>
      <SelectPanel.Trigger>
        <Button type="ghost" icon={<IconComponent iconName={icon} />} />
      </SelectPanel.Trigger>
      <SelectPanel.Body>
        <ModelLayersList
          domainObjects={domainObjects}
          // update={update}
          label={label}
          renderTarget={renderTarget}
        />
      </SelectPanel.Body>
    </SelectPanel>
  );
};
