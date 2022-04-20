import { SizeMeProps } from 'react-sizeme';

export type ChartProps = {
  data: Data[];
  size: SizeMeProps['size'];
  axisNames?: { x?: string; y?: string; z?: string };
  axisAutorange?: { x?: Autorange; y?: Autorange; z?: Autorange };
  axisTicksuffixes?: { x?: string; y?: string; z?: string };
  title?: string;
  autosize?: boolean;
  showLegend?: boolean;
  hovermode?: 'closest' | 'x' | 'y' | 'x unified' | 'y unified' | false;
  isTrajectory?: boolean;
  margin?: Partial<Plotly.Margin>;
  onExpand?: () => void;
  onCollapse?: () => void;
};

export type Data = any;

export type Autorange = true | false | 'reversed';
