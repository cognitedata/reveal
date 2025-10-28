import { SelectPanel } from '@cognite/cogs-lab';
import { useState, type ReactElement } from 'react';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { type RevealDomainObject, type RevealRenderTarget } from '../../../../architecture';
import { useOnUpdateDomainObject } from '../../hooks/useOnUpdate';

export const ModelLayersList = ({
  domainObjects,
  label,
  renderTarget
}: {
  domainObjects: RevealDomainObject[];
  label?: string;
  renderTarget: RevealRenderTarget;
}): ReactElement => {
  if (domainObjects.length === 0) {
    return <></>;
  }

  return (
    <>
      {label !== undefined && (
        <SelectPanel.Section>
          <WholeLayerVisibilitySelectItem
            label={label}
            domainObjects={domainObjects}
            renderTarget={renderTarget}
          />
        </SelectPanel.Section>
      )}
      <SelectPanel.Section>
        {domainObjects.map((domainObject) => (
          <ModelVisibilityItem
            key={domainObject.uniqueId}
            domainObject={domainObject}
            renderTarget={renderTarget}
          />
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
      }}
    />
  );
}
