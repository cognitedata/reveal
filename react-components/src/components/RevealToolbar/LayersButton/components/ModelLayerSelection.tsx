import { SelectPanel } from '@cognite/cogs-lab';
import { IconWrapper, ChevronRightSmallIcon } from '@cognite/cogs.js';
import { type ReactElement, useCallback } from 'react';
import { type ModelHandler } from '../ModelHandler';
import { ModelLayersList } from './ModelLayersList';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { RevealDomainObject, RevealRenderTarget } from '../../../../architecture';

type UpdateCallback = () => void;

type ModelLayerSelectionProps = {
  label: string;
  domainObjects: RevealDomainObject[];
  // update: UpdateCallback;
  renderTarget: RevealRenderTarget;
};

export const ModelLayerSelection = ({
  label,
  domainObjects,
  // update,
  renderTarget
}: ModelLayerSelectionProps): ReactElement => {
  const isDisabled = domainObjects.length === 0;

  /* const updateCallback = useCallback(() => {
    update();
  }, [update]); */

  return (
    <SelectPanel placement="right" hideOnOutsideClick={true} openOnHover={!isDisabled}>
      <SelectPanel.Trigger>
        <WholeLayerVisibilitySelectItem
          label={label}
          domainObjects={domainObjects}
          // update={updateCallback}
          trailingContent={
            <IconWrapper size={16}>
              <ChevronRightSmallIcon />
            </IconWrapper>
          }
          renderTarget={renderTarget}
          disabled={isDisabled}
        />
      </SelectPanel.Trigger>
      <SelectPanel.Body>
        <ModelLayersList
          domainObjects={domainObjects}
          // update={updateCallback}
          disabled={isDisabled}
          renderTarget={renderTarget}
        />
      </SelectPanel.Body>
    </SelectPanel>
  );
};
