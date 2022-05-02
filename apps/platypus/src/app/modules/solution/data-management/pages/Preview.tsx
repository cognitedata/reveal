import { Flex, Title } from '@cognite/cogs.js';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import services from '@platypus-app/di';
import { useErrorLogger } from '@platypus-app/hooks/useErrorLogger';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { SolutionState } from '@platypus-app/redux/reducers/global/solutionReducer';
import {
  SolutionDataModel,
  SolutionDataModelType,
} from '@platypus/platypus-core';
import { useEffect, useState } from 'react';
import { DataPreviewTable } from '../components/DataPreviewTable/DataPreviewTable';
import { TypeList } from '../components/TypeList/TypeList';

const dataModelService = services().solutionDataModelService;

export const Preview = () => {
  const [selectedType, setSelected] = useState<SolutionDataModelType | null>(
    null
  );
  const errorLogger = useErrorLogger();
  const { t } = useTranslation('DataPreview');
  const { selectedSchema } = useSelector<SolutionState>(
    (state) => state.solution
  );
  const [solutionDataModel, setSolutionDataModel] = useState<SolutionDataModel>(
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
