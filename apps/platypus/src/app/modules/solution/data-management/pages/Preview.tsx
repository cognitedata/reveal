import { useEffect, useRef } from 'react';
import {
  useLocation,
  Navigate,
  useSearchParams,
  useParams,
} from 'react-router-dom';

import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { FlexPlaceholder } from '@platypus-app/components/Placeholder/FlexPlaceholder';
import { useNavigate } from '@platypus-app/flags/useNavigate';
import { useDataModelTypeDefs } from '@platypus-app/hooks/useDataModelActions';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { DataManagementState } from '@platypus-app/redux/reducers/global/dataManagementReducer';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { mixerApiInlineTypeDirectiveName } from '@platypus-core/domain/data-model';
import { useQueryClient } from '@tanstack/react-query';

import { getQueryParameter } from '@cognite/cdf-utilities';
import { Flex, Modal } from '@cognite/cogs.js';

import {
  DataPreviewTable,
  DataPreviewTableRef,
} from '../components/DataPreviewTable/DataPreviewTable';
import { TransformationIframe } from '../components/TransformationPlaceholder/TransformationIframe';
import { TypeList } from '../components/TypeList/TypeList';
import { useDataManagementPageUI } from '../hooks/useDataManagemenPageUI';
import { useDraftRows } from '../hooks/useDraftRows';

export interface PreviewProps {
  dataModelExternalId: string;
  space: string;
}

export const Preview = ({ dataModelExternalId, space }: PreviewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
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
  const { selectedType, isTransformationModalOpen, transformationId } =
    useSelector<DataManagementState>((state) => state.dataManagement);
  const { setSelectedType, clearState } = useDraftRows();

  const { setIsTransformationModalOpen } = useDataManagementPageUI();

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
      {selectedType && (
        <Modal
          visible={isTransformationModalOpen}
          title="Transformations"
          onOk={() => {
            // refetch aggregate count
            queryClient.refetchQueries(
              QueryKeys.PUBLISHED_ROWS_COUNT_BY_TYPE(
                space,
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
          size="full-screen"
        >
          <div style={{ height: '100%' }}>
            <TransformationIframe transformationId={transformationId} />
          </div>
        </Modal>
      )}
      <SplitPanelLayout
        sidebarMinWidth={250}
        sidebar={
          <TypeList
            placeholder="Filter"
            dataModelExternalId={dataModelExternalId}
            // if it has directive, that means that it is inline types
            items={dataModelTypeDefs.types.filter((type) => {
              return (
                !type.directives?.length ||
                (type.directives?.length &&
                  !type.directives.some(
                    (typeDirective) =>
                      typeDirective.name === mixerApiInlineTypeDirectiveName
                  ))
              );
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
