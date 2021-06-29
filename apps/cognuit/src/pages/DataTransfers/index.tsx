import { DataTransfersProvider } from 'contexts/DataTransfersContext';

import DataTransfers from './DataTransfers';

export default () => (
  <DataTransfersProvider>
    <DataTransfers />
  </DataTransfersProvider>
);
