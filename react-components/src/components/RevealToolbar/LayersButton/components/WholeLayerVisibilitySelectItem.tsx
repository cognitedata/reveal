import { useEffect, useMemo, type ReactElement, type ReactNode } from 'react';
import { type ModelHandler } from '../ModelHandler';
import { SelectPanel } from '@cognite/cogs-lab';
import { CounterChip } from '@cognite/cogs.js';
import { Changes, RevealDomainObject, RevealRenderTarget } from '../../../../architecture';
import { RenderTarget } from 'three';
import { getRevealDomainUpdateSignal } from '../../../../architecture/concrete/reveal/signal/getRevealDomainObjectsSignal';
import { useDisposableSignal } from '../../../../utilities/signal/useDisposableSignal';

export const WholeLayerVisibilitySelectItem = ({
  label,
  trailingContent,
  domainObjects,
  // update,
  disabled,
  renderTarget
}: {
  label?: string;
  domainObjects: RevealDomainObject[];
  // update: () => void;
  trailingContent?: ReactNode;
  disabled?: boolean;
  renderTarget: RevealRenderTarget;
}): ReactElement => {
  // const checked = domainObjects.some((handler) => handler.isVisible(renderTarget));

  const checked = useSomeDomainObjectsVisible(domainObjects, renderTarget);
  return (
    <SelectPanel.Item
      variant="checkbox"
      label={label}
      checked={checked}
      disabled={disabled}
      onClick={() => {
        domainObjects.forEach((handler) => {
          handler.setVisibleInteractive(!checked, renderTarget);
        });
        // update();
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
  currentDomainObjects: RevealDomainObject[],
  renderTarget: RevealRenderTarget
): boolean {
  const disposableSignal = useMemo(
    () => getRevealDomainUpdateSignal(renderTarget, undefined, [Changes.visibleState]),
    [renderTarget]
  );

  const allDomainObjects = useDisposableSignal(disposableSignal);
  return useMemo(() => {
    return currentDomainObjects.some((obj) => obj.isVisible(renderTarget));
  }, [allDomainObjects]);
}
