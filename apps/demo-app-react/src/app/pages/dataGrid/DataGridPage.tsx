import { CogDataGrid } from '@cognite/cog-data-grid';
import { configSample } from './config-mock';
import { responseSample } from './response-mock';

export const DataGridPage = () => {
  return (
    <div style={{ height: '100%' }}>
      <CogDataGrid data={responseSample} config={configSample} />
    </div>
  );
};
