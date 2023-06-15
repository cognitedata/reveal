import { useEffect } from 'react';

import { DataModelSelectorModal } from '../containers/modals/DataModelSelectorModal';
import { useDataModelLocalStorage } from '../hooks/useLocalStorage';
import { useNavigation } from '../hooks/useNavigation';

export const OnboardingPage = () => {
  const navigate = useNavigation();
  const [selectedDataModel] = useDataModelLocalStorage();

  useEffect(() => {
    if (selectedDataModel) {
      navigate.toHomePage(
        selectedDataModel.space,
        selectedDataModel.dataModel,
        selectedDataModel.version
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataModel]);

  return <DataModelSelectorModal isVisible />;
};
