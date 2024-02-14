/*!
 * Copyright 2023 Cognite AS
 */

import { useState, type ReactElement, type MouseEvent } from 'react';

import { useReveal } from '../../RevealCanvas/ViewerContext';
import { Checkbox, Flex, Menu } from '@cognite/cogs.js';
import { StyledChipCount, StyledLabel, StyledSubMenu } from './elements';
import { type CognitePointCloudModel } from '@cognite/reveal';
import { uniqueId } from 'lodash';
import { type Reveal3DResourcesLayerStates, type Reveal3DResourcesLayersProps } from './types';
import { useTranslation } from '../../i18n/I18n';

export const PointCloudLayersContainer = ({
  layerProps,
  onChange
}: {
  layerProps: Reveal3DResourcesLayersProps;
  onChange: (cadState: Reveal3DResourcesLayerStates['pointCloudLayerData']) => void;
}): ReactElement => {
  const { t } = useTranslation();
  const viewer = useReveal();
  const [visible, setVisible] = useState(false);
  const { pointCloudLayerData } = layerProps.reveal3DResourcesLayerData;
  const { storeStateInUrl } = layerProps;
  const count = pointCloudLayerData.length.toString();
  const someModelVisible = !pointCloudLayerData.every((data) => !data.isToggled);
  const indeterminate = pointCloudLayerData.some((data) => !data.isToggled);

  const handlePointCloudVisibility = (model: CognitePointCloudModel): void => {
    const affectedPointCloudData = pointCloudLayerData.find((data) => data.model === model);
    if (affectedPointCloudData !== undefined) {
      affectedPointCloudData.isToggled = !affectedPointCloudData.isToggled;
      model.visible = affectedPointCloudData.isToggled;
    }
    viewer.requestRedraw();
    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      pointCloudLayerData
    }));

    if (storeStateInUrl !== undefined) {
      onChange(pointCloudLayerData);
    }
  };

  const handleAllPointCloudModelsVisibility = (visible: boolean): void => {
    pointCloudLayerData.forEach((data) => {
      data.isToggled = visible;
      data.model.visible = visible;
    });
    viewer.requestRedraw();

    layerProps.setReveal3DResourcesLayerData((prevResourcesStates) => ({
      ...prevResourcesStates,
      pointCloudLayerData
    }));

    if (storeStateInUrl !== undefined) {
      onChange(pointCloudLayerData);
    }
  };
  const pointCloudModelContent = (): ReactElement => {
    return (
      <StyledSubMenu
        onClick={(event: MouseEvent<HTMLElement>) => {
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
          appendTo={viewer.domElement ?? document.body}
          visible={visible}
          onClickOutside={() => {
            setVisible(false);
          }}
          content={pointCloudModelContent()}>
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
            <StyledLabel> {t('POINT_CLOUDS', 'Point clouds')} </StyledLabel>
            <StyledChipCount label={count} hideTooltip type="neutral" />
          </Flex>
        </Menu.Submenu>
      )}
    </div>
  );
};
