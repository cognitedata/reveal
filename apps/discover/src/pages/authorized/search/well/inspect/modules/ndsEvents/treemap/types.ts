import { TreeMapData } from 'components/Treemap';

export interface NdsTreemapProps {
  data: TreeMapData;
}

export interface NdsTreemapWellboreData {
  name: string;
  id: string;
  numberOfEvents: number;
}
