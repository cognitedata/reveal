import { default as EmptyStateArrowGraphic } from './EmptyStateArrowGraphic.svg';
import { default as ProfilingGraphic } from './ProfilingGraphic.png';
import { default as SidePanelGraphic } from './SidePanelGraphic.png';
import { default as TabsGraphic } from './TabsGraphic.png';

const graphics = {
  EmptyStateArrowGraphic,
  ProfilingGraphic,
  SidePanelGraphic,
  TabsGraphic,
};

export type GraphicType = keyof typeof graphics;

export default graphics;
