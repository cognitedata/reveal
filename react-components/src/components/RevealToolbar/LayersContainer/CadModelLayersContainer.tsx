/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';
import { useReveal } from '../../RevealContainer/RevealContext';
import { type CogniteCadModel } from '@cognite/reveal';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { uniqueId } from 'lodash';
import { type Reveal3DResourcesLayersProps } from './types';
import { useRevealContainerElement } from '../../RevealContainer/RevealContainerElementContext';
import { useTranslation } from '../../../common/i18n';
import { useUrlStateParam } from '../../../hooks/useUrlStateParam';

export const CadModelLayersContainer = ({
  layerProps
}: {
  layerProps: Reveal3DResourcesLayersProps;
}): ReactElement => {
  const { t } = useTranslation();
  const viewer = useReveal();
  const revealContainerElement = useRevealContainerElement();
  const urlParam = useUrlStateParam();
  const [visible, setVisible] = useState(false);

  const { cadLayerData } = layerProps.reveal3DResourcesLayerData;
  const { storeStateInUrl } = layerProps;

  const count = cadLayerData.length.toString();
  const someModelVisible = !cadLayerData.every((data) => !data.isToggled);
  const indeterminate = cadLayerData.some((data) => !data.isToggled);

  const handleCadModelVisibility = (model: CogniteCadModel): void => {
    const updatedSelectedCadModels = cadLayerData.map((data) => {
      if (data.model === model) {
        return {
          ...data,
          isToggled: !data.isToggled
        };
      } else {
        return data;
      }
    });
    model.visible = !model.visible;
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      cadLayerData: updatedSelectedCadModels
    }));

    if (storeStateInUrl ?? false) {
      setUrl(updatedSelectedCadModels);
    }
  };

  const handleAllCadModelsVisibility = (visible: boolean): void => {
    const updatedSelectedCadModels = cadLayerData.map((data) => ({
      ...data,
      isToggled: visible
    }));
    updatedSelectedCadModels.forEach((data) => {
      data.model.visible = visible;
    });
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      cadLayerData: updatedSelectedCadModels
    }));

    if (storeStateInUrl ?? false) {
      setUrl(updatedSelectedCadModels);
    }
  };

  const setUrl = (
    layerData: Array<{
      model: CogniteCadModel;
      isToggled: boolean;
      name?: string | undefined;
    }>
  ): void => {
    const urlCadLayersData = layerData.map((data) => {
      const index = viewer.models.indexOf(data.model);
      return {
        modelId: data.model.modelId,
        applied: data.isToggled,
        index
      };
    });
    urlParam.setUrlParamOnLayersChanged({ cadLayers: urlCadLayersData });
  };

  const cadModelContent = (): ReactElement => {
    return (
      <StyledSubMenu
        onClick={(event: MouseEvent) => {
          event.stopPropagation();
        }}>
        {cadLayerData.map((data) => (
          <Menu.Item
            key={uniqueId()}
            hideTooltip={true}
            hasCheckbox
            checkboxProps={{
              checked: data.isToggled,
              onChange: (e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handleCadModelVisibility(data.model);
              }
            }}>
            {data.name}
          </Menu.Item>
        ))}
      </StyledSubMenu>
    );
  };

  return (
    <div
      onClick={() => {
        setVisible((prevState) => !prevState);
      }}>
      {cadLayerData.length > 0 && (
        <Menu.Submenu
          appendTo={revealContainerElement ?? document.body}
          visible={visible}
          onClickOutside={() => {
            setVisible(false);
          }}
          content={cadModelContent()}
          title="CAD models">
          <Flex direction="row" justifyContent="space-between" gap={4}>
            <Checkbox
              checked={someModelVisible}
              indeterminate={indeterminate}
              onChange={(e) => {
                e.stopPropagation();
                handleAllCadModelsVisibility(e.target.checked);
                setVisible(true);
              }}
            />
            <StyledLabel> {t('CAD_MODELS')} </StyledLabel>
            <StyledChipCount label={count} hideTooltip type="neutral" />
          </Flex>
        </Menu.Submenu>
      )}
    </div>
  );
};
