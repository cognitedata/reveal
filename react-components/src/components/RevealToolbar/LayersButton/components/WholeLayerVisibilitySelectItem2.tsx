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
  renderTarget,
  shouldPropagate = true
}: {
  label?: string;
  domainObjects: RevealDomainObject[];
  trailingContent?: ReactNode;
  renderTarget: RevealRenderTarget;
  shouldPropagate?: boolean;
}): ReactElement => {
  const { someVisible, allVisible } = useSomeDomainObjectsVisible(domainObjects, renderTarget);
  return (
    <SelectPanel.Item
      variant="checkbox"
      label={label}
      checked={someVisible}
      indeterminate={someVisible && !allVisible}
      disabled={domainObjects.length === 0}
      onClick={(e) => {
        if (!shouldPropagate) {
          e.stopPropagation();
        }
        domainObjects.forEach((domainObject) => {
          domainObject.setVisibleInteractive(!someVisible, renderTarget);
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
): { someVisible: boolean; allVisible: boolean } {
  const disposableSignal = useMemo(
    () => getRevealDomainUpdateSignal(renderTarget, undefined, [Changes.visibleState]),
    [renderTarget]
  );

  const allDomainObjects = useDisposableSignal(disposableSignal);
  return useMemo(() => {
    const someVisible = relevantDomainObjects.some((domainObject) =>
      domainObject.isVisible(renderTarget)
    );
    const allVisible = relevantDomainObjects.every((domainObject) =>
      domainObject.isVisible(renderTarget)
    );

    return {
      someVisible,
      allVisible
    };
  }, [allDomainObjects, relevantDomainObjects, renderTarget]);
}
