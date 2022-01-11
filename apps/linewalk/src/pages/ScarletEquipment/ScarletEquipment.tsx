import { DataPanelProvider, StorageProvider } from './contexts';
import { Page } from './components';

const ScarletEquipment = () => {
  return (
    <StorageProvider>
      <DataPanelProvider>
        <Page />
      </DataPanelProvider>
    </StorageProvider>
  );
};

export default ScarletEquipment;
