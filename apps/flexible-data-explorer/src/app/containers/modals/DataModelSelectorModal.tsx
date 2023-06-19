import styled from 'styled-components';

import { Modal } from '@cognite/cogs.js';

import { DataModelSelector } from '../../components/selectors/DataModelSelector';
import { useDataModelLocalStorage } from '../../hooks/useLocalStorage';
import { useNavigation } from '../../hooks/useNavigation';
import { useListDataModelsQuery } from '../../services/dataModels/query/useListDataModelsQuery';
import { DataModelListResponse } from '../../services/types';

export const DataModelSelectorModal = ({
  isVisible = false,
  onModalClose,
  isClosable = false,
}: {
  isVisible?: boolean;
  onModalClose?: () => void;
  isClosable?: boolean;
}) => {
  const navigate = useNavigation();

  const [, setSelectedDataModel] = useDataModelLocalStorage();

  const { data, isLoading, isError } = useListDataModelsQuery();

  const handleSelectionClick = (item: DataModelListResponse) => {
    setSelectedDataModel({
      space: item.space,
      dataModel: item.externalId,
      version: item.version,
    });

    if (onModalClose) {
      onModalClose();
    }

    navigate.toHomePage(item.space, item.externalId, item.version);
  };

  return (
    <StyledModal
      visible={isVisible}
      closable={isClosable}
      hideFooter
      hidePaddings
      onCancel={() => onModalClose && onModalClose()}
    >
      <DataModelSelector
        dataModels={data}
        loading={isLoading}
        isError={isError}
        onSelectionClick={handleSelectionClick}
      />
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  width: unset !important;
  padding-bottom: 0 !important;

  .cogs-modal-header {
    display: none;
  }
`;
