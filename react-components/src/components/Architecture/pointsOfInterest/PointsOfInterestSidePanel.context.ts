import { createContext } from 'react';
import { useSelectedPoi } from './useSelectedPoi';
import { PoiList } from './PoiList';
import { PoiInfoPanelContent } from './PoiInfoPanelContent';
import { usePointsOfInterestTool } from './usePointsOfInterestTool';

export type PointsOfInterestSidePanelDependencies = {
  useSelectedPoi: typeof useSelectedPoi;
  usePointsOfInterestTool: typeof usePointsOfInterestTool;
  PoiList: typeof PoiList;
  PoiInfoPanelContent: typeof PoiInfoPanelContent;
};

export const defaultPointsOfInterestSidePanelDependencies = {
  useSelectedPoi,
  usePointsOfInterestTool,
  PoiList,
  PoiInfoPanelContent
};

export const PointsOfInteresSidePanelContext = createContext<PointsOfInterestSidePanelDependencies>(
  defaultPointsOfInterestSidePanelDependencies
);
