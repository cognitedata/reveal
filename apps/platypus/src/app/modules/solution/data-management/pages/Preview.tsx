import { useEffect, useRef } from 'react';
import {
  useLocation,
  Navigate,
  useSearchParams,
  useParams,
} from 'react-router-dom';

import { getQueryParameter } from '@cognite/cdf-utilities';
import { Flex } from '@cognite/cogs.js';

import { SplitPanelLayout } from '../../../../components/Layouts/SplitPanelLayout';
import { FlexPlaceholder } from '../../../../components/Placeholder/FlexPlaceholder';
import { useNavigate } from '../../../../flags/useNavigate';
import { useDataModelTypeDefs } from '../../../../hooks/useDataModelActions';
import { useSelectedDataModelVersion } from '../../../../hooks/useSelectedDataModelVersion';
import useSelector from '../../../../hooks/useSelector';
import { useTranslation } from '../../../../hooks/useTranslation';
import { DataManagementState } from '../../../../redux/reducers/global/dataManagementReducer';
import {
  DataPreviewTable,
  DataPreviewTableRef,
} from '../components/DataPreviewTable/DataPreviewTable';
import { TypeList } from '../components/TypeList/TypeList';
import { useDraftRows } from '../hooks/useDraftRows';
import { isEdgeType } from '../utils';

export interface PreviewProps {
  dataModelExternalId: string;
  space: string;
}

export const Preview = ({ dataModelExternalId, space }: PreviewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dataPreviewTableRef = useRef<DataPreviewTableRef>(null);
  const { version } = useParams() as { version: string };
  const [_, setSearchParams] = useSearchParams();

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);
  const dataModelTypeDefs = useDataModelTypeDefs(
    dataModelExternalId,
    version,
    space
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
  }, [clearState]);

  const { t } = useTranslation('DataPreview');

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
        `/${space}/${dataModelExternalId}/${selectedDataModelVersion.version}/data-management/preview?type=${firstAvailableType.name}`
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
        replace
      />
    );
  }

  return (
    <div>
      <SplitPanelLayout
        sidebarMinWidth={250}
        sidebar={
          <TypeList
            placeholder="Filter"
            dataModelExternalId={dataModelExternalId}
            // if it has directive, that means that it is inline types
            items={dataModelTypeDefs.types.filter((type) => {
              return !isEdgeType(type);
            })}
            selectedTypeName={selectedType?.name}
            onClick={(item) => {
              setSearchParams((params) => {
                params.set('type', item.name);
                return params;
              });

              setSelectedType(
                dataModelExternalId,
                selectedDataModelVersion.version,
                item
              );
            }}
            space={space}
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
