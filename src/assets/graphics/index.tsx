import { default as EmptyStateArrowGraphic } from './EmptyStateArrowGraphic.svg';
import { default as ProfilingGraphic } from './ProfilingGraphic.svg';
import { default as SidePanelGraphic } from './SidePanelGraphic.svg';
import { default as TabsGraphic } from './TabsGraphic.svg';

const graphics = {
  EmptyStateArrowGraphic,
  ProfilingGraphic,
  SidePanelGraphic,
  TabsGraphic,
};

export type GraphicType = keyof typeof graphics;

export default graphics;
