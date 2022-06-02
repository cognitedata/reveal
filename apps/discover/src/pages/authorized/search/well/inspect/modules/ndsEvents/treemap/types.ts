import { TreeMapData } from 'components/Treemap';

import { NdsView } from '../types';

export interface NdsTreemapProps {
  data: TreeMapData;
  onClickTile?: (detailedViewNdsData: NdsView[]) => void;
}

export interface NdsTreemapWellboreData {
  name: string;
  id: string;
  numberOfEvents: number;
}
