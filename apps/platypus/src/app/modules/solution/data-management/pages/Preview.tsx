import { getQueryParameter } from '@cognite/cdf-utilities';
import { Flex } from '@cognite/cogs.js';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { ModalDialog } from '@platypus-app/components/ModalDialog';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import {
  useDataModel,
  useDataModelTypeDefs,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataManagementState } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { useEffect, useRef } from 'react';
import { useLocation, Navigate, useSearchParams } from 'react-router-dom';
import {
  DataPreviewTable,
  DataPreviewTableRef,
} from '../components/DataPreviewTable/DataPreviewTable';
import { TransformationIframe } from '../components/TransformationPlaceholder/TransformationIframe';
import { TypeList } from '../components/TypeList/TypeList';
import { useDraftRows } from '../hooks/useDraftRows';
import { useDataManagementPageUI } from '../hooks/useDataManagemenPageUI';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useNavigate } from '@platypus-app/flags/useNavigate';

export interface PreviewProps {
  dataModelExternalId: string;
}

export const Preview = ({ dataModelExternalId }: PreviewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const dataPreviewTableRef = useRef<DataPreviewTableRef>(null);
  const [, setSearchParams] = useSearchParams();
  const newQueryParameters: URLSearchParams = new URLSearchParams();

  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );

  const { data: dataModel } = useDataModel(dataModelExternalId);

  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);
  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );
  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    selectedVersionNumber
  );
  const selectedTypeNameFromQuery = getQueryParameter('type');
  const { selectedType, isTransformationModalOpen, transformationId } =
    useSelector<DataManagementState>((state) => state.dataManagement);
  const { setSelectedType, clearState } = useDraftRows();

  const { setIsTransformationModalOpen } = useDataManagementPageUI();

  useEffect(() => {
    return () => {
      clearState();
    };
  }, []);

  const { t } = useTranslation('DataPreview');
  const doesSupportRead = useCapabilities('transformationsAcl', [
    'READ',
  ]).isAclSupported;

  if (selectedTypeNameFromQuery && !selectedType) {
    const typeFromQuery = dataModelTypeDefs.types.find(
      (el) => el.name === selectedTypeNameFromQuery
    );
    if (typeFromQuery) {
      setSelectedType(
        dataModelExternalId,
        selectedDataModelVersion.version,
        typeFromQuery
      );
    }
    if (!typeFromQuery && dataModelTypeDefs.types.length > 0) {
      const firstAvailableType = dataModelTypeDefs.types[0];
      navigate(
        `/${dataModel?.space}/${dataModelExternalId}/${selectedDataModelVersion.version}/data/data-management/preview?type=${firstAvailableType.name}`
      );
    }
  }

  if (!selectedTypeNameFromQuery && dataModelTypeDefs.types.length > 0) {
    // make sure we preserve any existing query params
    const params = new URLSearchParams(location.search);
    params.set('type', dataModelTypeDefs.types[0].name);

    return (
      <Navigate
        to={{
          ...location,
          search: params.toString(),
        }}
      />
    );
  }

  return (
    <div>
      {selectedType && (
        <ModalDialog
          visible={isTransformationModalOpen}
          title="Transformations"
          onOk={() => {
            // refetch aggregate count
            queryClient.refetchQueries(
              QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(
                dataModelExternalId,
                selectedType.name
              )
            );

            // tell table to refetch data
            dataPreviewTableRef.current &&
              dataPreviewTableRef.current.purgeInfiniteCache();

            setIsTransformationModalOpen(false, null);
          }}
          onCancel={() => {
            setIsTransformationModalOpen(false, null);
          }}
          okType="primary"
          width="90%"
          height="86%"
        >
          <div style={{ flex: 1 }}>
            <TransformationIframe transformationId={transformationId} />
          </div>
        </ModalDialog>
      )}
      <SplitPanelLayout
        sidebarMinWidth={250}
        sidebar={
          <TypeList
            placeholder="Filter"
            dataModelExternalId={dataModelExternalId}
            items={dataModelTypeDefs.types.filter(
              (type) => !type.directives?.length // if it has directive, that means that it is inline types
            )}
            selectedTypeName={selectedType?.name}
            onClick={(item) => {
              newQueryParameters.set('type', item.name);
              setSearchParams(newQueryParameters);

              setSelectedType(
                dataModelExternalId,
                selectedDataModelVersion.version,
                item
              );
            }}
          />
        }
        content={
          selectedType ? (
            <Flex direction="column" style={{ flex: 1 }}>
              <DataPreviewTable
                key={selectedType?.name}
                dataModelType={selectedType}
                dataModelTypeDefs={dataModelTypeDefs}
                dataModelExternalId={dataModelExternalId}
                ref={dataPreviewTableRef}
                // ensure we pass real version number and not "latest" here
                version={selectedDataModelVersion.version}
                space={selectedDataModelVersion.space}
              />
            </Flex>
          ) : (
            <FlexPlaceholder
              data-cy="data-preview-no-types-selected"
              title={t(
                'select-type-title',
                'The data model has not yet been published'
              )}
              description={t(
                'select-type-body',
                'You need to publish your data model to be able to populate it'
              )}
            />
          )
        }
      />
    </div>
  );
};
