import { useMemo, type ReactElement, type ReactNode } from 'react';
import { SelectPanel } from '@cognite/cogs-lab';
import { CounterChip } from '@cognite/cogs.js';
import {
  Changes,
  type RevealDomainObject,
  type RevealRenderTarget
} from '../../../../architecture';
import { getRevealDomainUpdateSignal } from '../../../../architecture/concrete/reveal/signal/getRevealDomainObjectsSignal';
import { useDisposableSignal } from '../../../../utilities/signal/useDisposableSignal';

export const WholeLayerVisibilitySelectItem = ({
  label,
  trailingContent,
  domainObjects,
  disabled,
  renderTarget
}: {
  label?: string;
  domainObjects: RevealDomainObject[];
  trailingContent?: ReactNode;
  disabled?: boolean;
  renderTarget: RevealRenderTarget;
}): ReactElement => {
  const checked = useSomeDomainObjectsVisible(domainObjects, renderTarget);
  return (
    <SelectPanel.Item
      variant="checkbox"
      label={label}
      checked={checked}
      disabled={disabled}
      onClick={() => {
        domainObjects.forEach((domainObject) => {
          domainObject.setVisibleInteractive(!checked, renderTarget);
        });
      }}
      trailingContent={
        <>
          <CounterChip counter={domainObjects.length} />
          {trailingContent}
        </>
      }
      size="medium"
    />
  );
};

function useSomeDomainObjectsVisible(
  relevantDomainObjects: RevealDomainObject[],
  renderTarget: RevealRenderTarget
): boolean {
  const disposableSignal = useMemo(
    () => getRevealDomainUpdateSignal(renderTarget, undefined, [Changes.visibleState]),
    [renderTarget]
  );

  const allDomainObjects = useDisposableSignal(disposableSignal);
  return useMemo(() => {
    return relevantDomainObjects.some((domainObject) => domainObject.isVisible(renderTarget));
  }, [allDomainObjects, relevantDomainObjects, renderTarget]);
}
