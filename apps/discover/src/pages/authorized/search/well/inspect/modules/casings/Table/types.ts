import { CasingAssemblyView, CasingSchematicView } from '../types';

export interface CasingsWellsTableData {
  id: CasingSchematicView['wellName'];
  wellName: CasingSchematicView['wellName'];
  data: CasingSchematicView[];
}

export interface CasingAssemblyTableView extends CasingAssemblyView {
  wellboreName: CasingSchematicView['wellboreName'];
}
