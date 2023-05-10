import { useParams } from 'react-router-dom';
import { DataModelSelector } from '../components/selectors/DataModelSelector';
import { useNavigation } from '../hooks/useNavigation';
import { useListDataModelsQuery } from '../services/dataModels/query/useListDataModelsQuery';
import { DataModelList } from '../services/FDMClient';

export const OnboardingPage = () => {
  const { space, dataModel, version } = useParams();
  const isDataModelSelected = Boolean(space && dataModel && version);
  const navigate = useNavigation();

  const { data, isLoading } = useListDataModelsQuery();

  const handleSelectionClick = (item: DataModelList) => {
    navigate.toHomePage(item.space, item.externalId, item.version);
  };

  if (!isDataModelSelected) {
    // Check local storage for previous selected routes
    // Do a request to fetch all data models

    return (
      <DataModelSelector
        dataModels={data}
        loading={isLoading}
        onSelectionClick={handleSelectionClick}
      />
    );
  }

  return null;
};
