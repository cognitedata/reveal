import { TreeMapData } from 'components/Treemap';

export interface NdsTreemapProps {
  data: TreeMapData;
  tileCursor?: string;
  onClickTile?: (wellboreId: string) => void;
}

export interface NdsTreemapWellboreData {
  name: string;
  id: string;
  numberOfEvents: number;
}
