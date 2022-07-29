import { Flex } from '@cognite/cogs.js';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataModelTypeDefsType } from '@platypus/platypus-core';
import { useState } from 'react';
import { DataPreviewTable } from '../components/DataPreviewTable/DataPreviewTable';
import { TypeList } from '../components/TypeList/TypeList';
import { TransformationPlaceholder } from '../components/TransformationPlaceholder/TransformationPlaceholder';
import {
  useTransformation,
  useTransformationMutate,
} from '../hooks/useTransformationAPI';
import { TransformationIframe } from '../components/TransformationPlaceholder/TransformationIframe';
import { useHistory } from 'react-router-dom';
import { getQueryParameter } from '@cognite/cdf-utilities';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import {
  useDataModelTypeDefs,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { usePreviewPageData } from '../hooks/usePreviewPageData';
import { PreviewPageHeader } from '../components/PreviewPageHeader/PreviewPageHeader';
export interface PreviewProps {
  dataModelExternalId: string;
}

export const Preview = ({ dataModelExternalId }: PreviewProps) => {
  const history = useHistory();
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
  const [selectedType, setSelected] = useState<DataModelTypeDefsType | null>(
    dataModelTypeDefs.types.find(
      (el) => el.name === selectedTypeNameFromQuery
    ) || null
  );

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

  const transformationMutate = useTransformationMutate();

  const onLoadDataFromTransformation = async () => {
    transformationMutate.mutate(
      {
        externalId: dataModelExternalId,
        typeKey,
      },
      {
        onSuccess: () => {
          setIsModalOpen(true);
        },
      }
    );
  };
  const {
    isError: previewDataError,
    isFetched: isPreviewFetched,
    data: previewData,
  } = usePreviewPageData(
    {
      dataModelId: selectedDataModelVersion.externalId,
      dataModelType: selectedType!,
      dataModelTypeDefs,
      version: selectedDataModelVersion.version,
      limit: 100,
    },
    false
  );
  const mergedPreviewData =
    previewData?.pages.flatMap((page) => page.items) ?? [];
  const shouldShowTransformation =
    transformation.data?.id == null &&
    transformation.status === 'success' &&
    !transformationMutate.isError &&
    !previewDataError &&
    isPreviewFetched &&
    previewData &&
    mergedPreviewData.length === 0;

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
            items={dataModelTypeDefs.types.filter(
              (type) => !type.directives?.length // if it has directive, that means that it is inline types
            )}
            selectedTypeName={selectedType?.name}
            onClick={(item) => {
              history.push({
                search: `type=${item.name}`,
              });
              setSelected(item);
            }}
          />
        }
        content={
          selectedType ? (
            <Flex direction="column" style={{ flex: 1 }}>
              {shouldShowTransformation && (
                <TransformationPlaceholder
                  doesSupportAcl={!!doesSupportWrite}
                  onLoadClick={onLoadDataFromTransformation}
                />
              )}
              <PreviewPageHeader
                transformationId={transformation.data?.id}
                previewDataLength={mergedPreviewData.length}
                title={selectedType.name}
                onTransformationClick={setIsModalOpen}
              />
              <DataPreviewTable
                key={`${isModalOpen}_key`}
                dataModelType={selectedType}
                dataModelTypeDefs={dataModelTypeDefs}
                solutionId={dataModelExternalId}
                version={selectedDataModelVersion.version}
              />
            </Flex>
          ) : (
            <FlexPlaceholder
              data-cy="data-preview-no-types-selected"
              title={t('select-type-title', 'No types selected')}
              description={t(
                'select-type-body',
                'Please select a type from the list panel to preview the data.'
              )}
            />
          )
        }
      />
    </div>
  );
};
