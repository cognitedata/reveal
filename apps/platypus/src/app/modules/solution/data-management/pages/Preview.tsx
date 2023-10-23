import { useEffect } from 'react';
import { useLocation, Navigate, useSearchParams } from 'react-router-dom';

import { Flex } from '@cognite/cogs.js';

import { SplitPanelLayout } from '../../../../components/Layouts/SplitPanelLayout';
import { FlexPlaceholder } from '../../../../components/Placeholder/FlexPlaceholder';
import { useDMContext } from '../../../../context/DMContext';
import { useTranslation } from '../../../../hooks/useTranslation';
import { DataPreviewTable } from '../components/DataPreviewTable/DataPreviewTable';
import { TypeList } from '../components/TypeList/TypeList';
import { useDraftRows } from '../hooks/useDraftRows';
export const Preview = () => {
  const location = useLocation();
  const [_, setSearchParams] = useSearchParams();

  const {
    typeDefs,
    selectedDataType: dataType,
    selectedDataModel,
  } = useDMContext();
  const { clearState, setSelectedType } = useDraftRows();

  useEffect(() => {
    // There are parts of the screen that are using redux
    // that depends on the selected type, so we need to make sure
    // that we set the selected type on init and on type click
    if (dataType) {
      setSelectedType(
        selectedDataModel.externalId,
        selectedDataModel.version,
        dataType!
      );
    }
    return () => {
      clearState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearState, setSelectedType]);

  const { t } = useTranslation('DataPreview');

  if (!dataType && typeDefs.types.length > 0) {
    // make sure we preserve any existing query params
    const params = new URLSearchParams(location.search);
    params.set('type', typeDefs.types[0].name);
    setSelectedType(
      selectedDataModel.externalId,
      selectedDataModel.version,
      dataType!
    );

    return (
      <Navigate
        to={{
          ...location,
          search: params.toString(),
        }}
        replace
      />
    );
  }

  return (
    <SplitPanelLayout
      sidebarMinWidth={250}
      sidebar={
        <TypeList
          onClick={(item) => {
            setSearchParams((params) => {
              params.set('type', item.name);
              setSelectedType(
                selectedDataModel.externalId,
                selectedDataModel.version,
                item
              );
              return params;
            });
          }}
        />
      }
      content={
        dataType ? (
          <Flex direction="column" style={{ flex: 1 }}>
            <DataPreviewTable />
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
  );
};
