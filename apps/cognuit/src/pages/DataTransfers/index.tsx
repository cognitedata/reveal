import DataTransfers from './DataTransfers';
import { DataTransfersProvider } from './context/DataTransfersContext';

export default () => (
  <DataTransfersProvider>
    <DataTransfers />
  </DataTransfersProvider>
);
