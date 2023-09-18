/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement } from 'react';

import { useReveal } from '../../RevealContainer/RevealContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { type CognitePointCloudModel } from '@cognite/reveal';
import { uniqueId } from 'lodash';
import { type Reveal3DResourcesLayersProps } from './types';
import { useRevealContainerElement } from '../../RevealContainer/RevealContainerElementContext';
import { useTranslation } from '../../../common/i18n';

export const PointCloudLayersContainer = ({
  layerProps
}: {
  layerProps: Reveal3DResourcesLayersProps;
}): ReactElement => {
  const { t } = useTranslation();
  const viewer = useReveal();
  const revealContainerElement = useRevealContainerElement();
  const [visible, setVisible] = useState(false);
  const { pointCloudLayerData } = layerProps.reveal3DResourcesLayerData;
  const count = pointCloudLayerData.length.toString();
  const someModelVisible = !pointCloudLayerData.every((data) => !data.isToggled);
  const indeterminate = pointCloudLayerData.some((data) => !data.isToggled);

  const handlePointCloudVisibility = (model: CognitePointCloudModel): void => {
    const updatedPointCloudModels = pointCloudLayerData.map((data) => {
      if (data.model === model) {
        data.isToggled = !data.isToggled;
        model.setDefaultPointCloudAppearance({ visible: data.isToggled });
      }
      return data;
    });
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      pointCloudLayerData: updatedPointCloudModels
    }));
  };

  const handleAllPointCloudModelsVisibility = (visible: boolean): void => {
    pointCloudLayerData.forEach((data) => {
      data.isToggled = visible;
      data.model.setDefaultPointCloudAppearance({ visible });
    });
    viewer.requestRedraw();

    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      pointCloudLayerData
    }));
  };

  const pointCloudModelContent = (): ReactElement => {
    return (
      <StyledSubMenu
        onClick={(event: MouseEvent) => {
          event.stopPropagation();
        }}>
        {pointCloudLayerData.map((data) => (
          <Menu.Item
            key={uniqueId()}
            hasCheckbox
            checkboxProps={{
              checked: data.isToggled,
              onChange: (e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handlePointCloudVisibility(data.model);
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
      {pointCloudLayerData.length > 0 && (
        <Menu.Submenu
          appendTo={revealContainerElement ?? document.body}
          visible={visible}
          onClickOutside={() => {
            setVisible(false);
          }}
          content={pointCloudModelContent()}
          title="Point clouds">
          <Flex direction="row" justifyContent="space-between">
            <Checkbox
              checked={someModelVisible}
              indeterminate={indeterminate}
              onChange={(e) => {
                e.stopPropagation();
                handleAllPointCloudModelsVisibility(e.target.checked);
                setVisible(true);
              }}
            />
            <StyledLabel> {t('POINT_CLOUDS')} </StyledLabel>
            <StyledChipCount label={count} hideTooltip type="neutral" />
          </Flex>
        </Menu.Submenu>
      )}
    </div>
  );
};
