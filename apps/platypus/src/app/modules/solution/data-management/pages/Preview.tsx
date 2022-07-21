import { Flex, Title, Button } from '@cognite/cogs.js';
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
} from '@platypus-app/hooks/useTransformationAPI';
import { TransformationIframe } from '../components/TransformationPlaceholder/TransformationIframe';
import { useHistory } from 'react-router-dom';
import { getQueryParameter } from '@cognite/cdf-utilities';

import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import {
  useDataModelTypeDefs,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';

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

  const typeKey = `${selectedType?.name}_${selectedDataModelVersion.version}`;

  const transformation = useTransformation(typeKey, dataModelExternalId);
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
              {transformation.data?.id == null &&
                transformation.status === 'success' &&
                !transformationMutate.isError && (
                  <TransformationPlaceholder
                    onLoadClick={onLoadDataFromTransformation}
                  />
                )}
              <Flex
                style={{ height: 56, padding: '10px 16px' }}
                alignItems="center"
                justifyContent="space-between"
              >
                <Title level={5}>{selectedType.name}</Title>
                {transformation.data?.id && (
                  <Button
                    data-cy="edit-transformation"
                    type="primary"
                    icon="ExternalLink"
                    iconPlacement="right"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {t('transformation-edit', 'Edit transformations')}
                  </Button>
                )}
              </Flex>
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
