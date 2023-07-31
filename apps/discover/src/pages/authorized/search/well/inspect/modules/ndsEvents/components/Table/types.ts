import { NdsView } from '../../types';

export interface NdsTableProps {
  data: NdsView[];
  onClickView: (wellboreId: string) => void;
}

export interface NdsWellsTableData {
  id: NdsView['wellName'];
  wellName: NdsView['wellName'];
  data: NdsView[];
}
