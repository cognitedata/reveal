import { getQueryParameter } from '@cognite/cdf-utilities';
import { Flex } from '@cognite/cogs.js';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import {
  useDataModelTypeDefs,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataManagementState } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { useState, useEffect } from 'react';
import { Redirect, useHistory, useLocation } from 'react-router-dom';
import { DataPreviewTable } from '../components/DataPreviewTable/DataPreviewTable';
import { TransformationIframe } from '../components/TransformationPlaceholder/TransformationIframe';
import { TransformationPlaceholder } from '../components/TransformationPlaceholder/TransformationPlaceholder';
import { TypeList } from '../components/TypeList/TypeList';
import { useDraftRows } from '../hooks/useDraftRows';
import {
  useTransformation,
  useTransformationMutate,
} from '../hooks/useTransformationAPI';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
export interface PreviewProps {
  dataModelExternalId: string;
}

export const Preview = ({ dataModelExternalId }: PreviewProps) => {
  const history = useHistory();
  const location = useLocation();

  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);
  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId
  );
  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    selectedVersionNumber
  );
  const selectedTypeNameFromQuery = getQueryParameter('type');
  const { selectedType } = useSelector<DataManagementState>(
    (state) => state.dataManagement
  );
  const { setSelectedType, clearState } = useDraftRows();

  useEffect(() => {
    return () => {
      clearState();
    };
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('DataPreview');
  const doesSupportRead = useCapabilities('transformationsAcl', [
    'READ',
  ]).isAclSupported;
  const doesSupportWrite = useCapabilities('transformationsAcl', [
    'WRITE',
  ]).isAclSupported;

  const typeKey = `${selectedType?.name}_${selectedDataModelVersion.version}`;
  const transformation = useTransformation(
    typeKey,
    selectedDataModelVersion.externalId,
    !!doesSupportRead
  );

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
  }

  const transformationMutate = useTransformationMutate();

  const { track } = useMixpanel();

  const onLoadDataFromTransformation = async () => {
    transformationMutate.mutate(
      {
        externalId: dataModelExternalId,
        typeKey,
      },
      {
        onSuccess: () => {
          track('Transformations', {
            dataModel: dataModelExternalId,
          });
          setIsModalOpen(true);
        },
      }
    );
  };
  const shouldShowTransformation =
    transformation.data?.id == null &&
    transformation.status === 'success' &&
    !transformationMutate.isError;

  if (!selectedTypeNameFromQuery && dataModelTypeDefs.types.length > 0) {
    return (
      <Redirect
        to={{ ...location, search: `type=${dataModelTypeDefs.types[0].name}` }}
      />
    );
  }

  return (
    <div>
      {selectedType && (
        <ModalDialog
          visible={isModalOpen}
          title="Transformations"
          onOk={() => {
            setIsModalOpen(false);
          }}
          onCancel={() => {
            setIsModalOpen(false);
          }}
          okType="primary"
          width="90%"
          height="86%"
        >
          <div style={{ flex: 1 }}>
            {transformation.isLoading && <p>Loading</p>}
            <TransformationIframe transformationId={transformation.data?.id} />
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
              history.push({
                search: `type=${item.name}`,
              });
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
              {shouldShowTransformation && (
                <TransformationPlaceholder
                  dataModelType={selectedType}
                  externalId={dataModelExternalId}
                  doesSupportAcl={!!doesSupportWrite}
                  onLoadClick={onLoadDataFromTransformation}
                />
              )}

              <DataPreviewTable
                key={`${isModalOpen}_key`}
                dataModelType={selectedType}
                dataModelTypeDefs={dataModelTypeDefs}
                dataModelExternalId={dataModelExternalId}
                version={selectedDataModelVersion.version}
                // everything from here bellow needs to be refactored
                transformationId={transformation.data?.id}
                onTransformationClick={setIsModalOpen}
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
