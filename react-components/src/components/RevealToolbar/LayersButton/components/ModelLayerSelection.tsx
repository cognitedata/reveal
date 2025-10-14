import { SelectPanel } from '@cognite/cogs-lab';
import { IconWrapper, ChevronRightSmallIcon } from '@cognite/cogs.js';
import { type ReactElement } from 'react';
import { ModelLayersList } from './ModelLayersList';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { type RevealDomainObject, type RevealRenderTarget } from '../../../../architecture';
import { useHoverHandlers } from '../hooks/useHoverHandlers';

type ModelLayerSelectionProps = {
  label: string;
  domainObjects: RevealDomainObject[];
  renderTarget: RevealRenderTarget;
};

export const ModelLayerSelection = ({
  label,
  domainObjects,
  renderTarget
}: ModelLayerSelectionProps): ReactElement => {
  const isDisabled = domainObjects.length === 0;
  const { hoverHandlers, isPanelOpen, setPanelToClose } = useHoverHandlers(isDisabled);

  return (
    <SelectPanel
      placement="right"
      hideOnOutsideClick={true}
      openOnHover={false}
      visible={isPanelOpen}
      onHide={setPanelToClose}>
      <SelectPanel.Trigger>
        <div {...hoverHandlers}>
          <WholeLayerVisibilitySelectItem
            label={label}
            domainObjects={domainObjects}
            trailingContent={
              <IconWrapper size={16}>
                <ChevronRightSmallIcon />
              </IconWrapper>
            }
            renderTarget={renderTarget}
            shouldPropagate={false}
          />
        </div>
      </SelectPanel.Trigger>
      <SelectPanel.Body {...hoverHandlers}>
        <ModelLayersList domainObjects={domainObjects} renderTarget={renderTarget} />
      </SelectPanel.Body>
    </SelectPanel>
  );
};
