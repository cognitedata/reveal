import { default as ProfilingGraphic } from './ProfilingGraphic.png';
import { default as SidePanelGraphic } from './SidePanelGraphic.png';
import { default as TabsGraphic } from './TabsGraphic.png';

const graphics = {
  ProfilingGraphic,
  SidePanelGraphic,
  TabsGraphic,
};

export type GraphicType = keyof typeof graphics;

export default graphics;
