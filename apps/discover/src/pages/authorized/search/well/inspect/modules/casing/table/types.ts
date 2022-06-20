import { CasingsView } from '../types';

export interface CasingsWellsTableData {
  id: CasingsView['wellName'];
  wellName: CasingsView['wellName'];
  data: CasingsView[];
}
