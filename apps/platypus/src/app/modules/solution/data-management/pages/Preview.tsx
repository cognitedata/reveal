import { Flex, Title, Button } from '@cognite/cogs.js';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { TOKENS } from '@platypus-app/di';
import { useErrorLogger } from '@platypus-app/hooks/useErrorLogger';
import { useInjection } from '@platypus-app/hooks/useInjection';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import {
  DataModelTypeDefs,
  DataModelTypeDefsType,
} from '@platypus/platypus-core';
import { useEffect, useState } from 'react';
import { DataPreviewTable } from '../components/DataPreviewTable/DataPreviewTable';
import { TypeList } from '../components/TypeList/TypeList';
import { TransformationPlaceholder } from '../components/TransformationPlaceholder/TransformationPlaceholder';
import {
  useTransformation,
  useTransformationMutate,
} from '@platypus-app/hooks/useTransformationAPI';
import { TransformationIframe } from '../components/TransformationPlaceholder/TransformationIframe';

export const Preview = () => {
  const [selectedType, setSelected] = useState<DataModelTypeDefsType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const errorLogger = useErrorLogger();
  const { t } = useTranslation('DataPreview');
  const { selectedVersion } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const [solutionDataModel, setSolutionDataModel] = useState<DataModelTypeDefs>(
    {
      types: [],
    }
  );
  const typeKey = `${selectedType?.name}_${selectedVersion.version}`;

  const transformation = useTransformation(typeKey, selectedVersion.externalId);
  const transformationMutate = useTransformationMutate();
  useEffect(() => {
    if (selectedVersion.schema) {
      try {
        const newState = dataModelTypeDefsBuilder.parseSchema(
          selectedVersion.schema
        );
        setSolutionDataModel(newState);
      } catch (err: any) {
        errorLogger.log(err);
        Notification({ type: 'error', message: err.message });
      }
    }

    // eslint-disable-next-line
  }, []);
  const onLoadDataFromTransformation = async () => {
    transformationMutate.mutate(
      {
        externalId: selectedVersion.externalId,
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
            items={solutionDataModel.types.filter(
              (type) => type.directives?.length
            )}
            onClick={(item: any) => setSelected(item)}
          />
        }
        content={
          selectedType ? (
            <div style={{ flex: 1 }}>
              {transformation.data?.id == null &&
                transformation.status === 'success' &&
                !transformationMutate.isError && (
                  <TransformationPlaceholder
                    onLoadClick={onLoadDataFromTransformation}
                  />
                )}
              <Flex
                style={{ height: 56, paddingLeft: 16, paddingRight: 16 }}
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
                solutionId={selectedVersion.externalId}
                version={selectedVersion.version}
              />
            </div>
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
