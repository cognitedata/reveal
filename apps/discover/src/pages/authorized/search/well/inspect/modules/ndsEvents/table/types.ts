import { NdsView } from '../types';

export interface NdsTableProps {
  data: NdsView[];
  onClickView: (detailedViewNdsData: NdsView[]) => void;
}

export interface NdsWellsTableData {
  id: NdsView['wellName'];
  wellName: NdsView['wellName'];
  data: NdsView[];
}
