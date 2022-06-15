import { Flex, Title } from '@cognite/cogs.js';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
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

export const Preview = () => {
  const [selectedType, setSelected] = useState<DataModelTypeDefsType | null>(
    null
  );
  const errorLogger = useErrorLogger();
  const { t } = useTranslation('DataPreview');
  const { selectedSchema } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const dataModelService = useInjection(TOKENS.dataModelService);
  const [solutionDataModel, setSolutionDataModel] = useState<DataModelTypeDefs>(
    {
      types: [],
    }
  );

  useEffect(() => {
    if (selectedSchema.schema) {
      try {
        const newState = dataModelService.parseSchema(selectedSchema.schema);
        setSolutionDataModel(newState);
      } catch (err: any) {
        errorLogger.log(err);
        Notification({ type: 'error', message: err.message });
      }
    }

    // eslint-disable-next-line
  }, []);

  return (
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
            <Flex style={{ height: 56, paddingLeft: 16 }} alignItems="center">
              <Title level={5}>{selectedType.name}</Title>
            </Flex>
            <DataPreviewTable
              dataModelType={selectedType}
              solutionId={selectedSchema.externalId}
              version={selectedSchema.version}
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
  );
};
