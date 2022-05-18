import { NdsView } from '../types';

export interface NdsTableProps {
  data: NdsView[];
}

export interface NdsWellsTableData {
  id: NdsView['wellName'];
  wellName: NdsView['wellName'];
  data: NdsView[];
}
