import React from 'react';

import { Menu } from '@cognite/cogs.js';
import { PointColorType } from '@cognite/reveal';

import {
  useContextualizeThreeDViewerStorePointCloud,
  updateVisualizationOptions,
} from '../../useContextualizeThreeDViewerStorePointCloud';

export const ColorTypeSelector = (): React.ReactElement => {
  const { visualizationOptions } = useContextualizeThreeDViewerStorePointCloud(
    (state) => ({
      visualizationOptions: state.visualizationOptions,
    })
  );

  const handleToggle = () => {
    const newColorType =
      visualizationOptions.pointColor === PointColorType.Classification
        ? PointColorType.Rgb
        : PointColorType.Classification;

    updateVisualizationOptions({ pointColor: newColorType });
  };

  return (
    <>
      <Menu.Item
        hasSwitch
        toggled={
          visualizationOptions.pointColor === PointColorType.Classification
        }
        onChange={handleToggle}
      >
        View Classification
      </Menu.Item>
    </>
  );
};
