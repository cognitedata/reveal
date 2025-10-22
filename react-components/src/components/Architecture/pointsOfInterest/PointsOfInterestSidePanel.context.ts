import { Context, createContext, ReactNode } from 'react';
import { useSelectedPoi } from './useSelectedPoi';
import { PoiList, PoiListProps } from './PoiList';
import { PoiInfoPanelContent } from './PoiInfoPanelContent';
import { usePointsOfInterestTool } from './usePointsOfInterestTool';

export type PointsOfInterestSidePanelDependencies = {
  useSelectedPoi: typeof useSelectedPoi;
  usePointsOfInterestTool: typeof usePointsOfInterestTool;
  PoiList: typeof PoiList;
  PoiInfoPanelContent: typeof PoiInfoPanelContent;
};

export const defaultPointsOfInterestSidePanelDependencies: { useSelectedPoi: typeof useSelectedPoi; usePointsOfInterestTool: typeof usePointsOfInterestTool; PoiList: ({ onRowClick, filter, pageLimit, values }: PoiListProps) => ReactNode; PoiInfoPanelContent: () => ReactNode; } = {
  useSelectedPoi,
  usePointsOfInterestTool,
  PoiList,
  PoiInfoPanelContent
};

export const PointsOfInterestSidePanelContext: Context<PointsOfInterestSidePanelDependencies> =
  createContext<PointsOfInterestSidePanelDependencies>(
    defaultPointsOfInterestSidePanelDependencies
  );
