import { type Context, createContext } from 'react';
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

export const defaultPointsOfInterestSidePanelDependencies: PointsOfInterestSidePanelDependencies = {
  useSelectedPoi,
  usePointsOfInterestTool,
  PoiList,
  PoiInfoPanelContent
};

export const PointsOfInterestSidePanelContext: Context<PointsOfInterestSidePanelDependencies> =
  createContext<PointsOfInterestSidePanelDependencies>(
    defaultPointsOfInterestSidePanelDependencies
  );
