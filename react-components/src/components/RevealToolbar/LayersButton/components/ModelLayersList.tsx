import { SelectPanel } from '@cognite/cogs-lab';
import { type ModelHandler } from '../ModelHandler';
import { useState, type ReactElement } from 'react';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { RevealDomainObject, RevealRenderTarget } from '../../../../architecture';
import { useOnUpdateDomainObject } from '../../../Architecture/hooks/useOnUpdate';

export const ModelLayersList = ({
  domainObjects,
  // update,
  label,
  disabled,
  renderTarget
}: {
  domainObjects: RevealDomainObject[];
  // update: () => void;
  label?: string;
  disabled?: boolean;
  renderTarget: RevealRenderTarget;
}): ReactElement => {
  if (disabled === true) {
    return <></>;
  }

  return (
    <>
      {label !== undefined && (
        <SelectPanel.Section>
          <WholeLayerVisibilitySelectItem
            label={label}
            domainObjects={domainObjects}
            // update={update}
            renderTarget={renderTarget}
          />
        </SelectPanel.Section>
      )}
      <SelectPanel.Section>
        {domainObjects.map((domainObject) => (
          <ModelVisibilityItem domainObject={domainObject} renderTarget={renderTarget} />
        ))}
      </SelectPanel.Section>
    </>
  );
};

function ModelVisibilityItem({
  domainObject,
  renderTarget
}: {
  domainObject: RevealDomainObject;
  renderTarget: RevealRenderTarget;
}): ReactElement {
  const [isVisible, setVisible] = useState(domainObject.isVisible(renderTarget));

  useOnUpdateDomainObject(domainObject, () => {
    setVisible(domainObject.isVisible(renderTarget));
  });

  return (
    <SelectPanel.Item
      key={domainObject.uniqueId}
      label={domainObject.name}
      variant="checkbox"
      checked={isVisible}
      onClick={() => {
        domainObject.setVisibleInteractive(!isVisible, renderTarget);
        // update();
      }}
    />
  );
}
