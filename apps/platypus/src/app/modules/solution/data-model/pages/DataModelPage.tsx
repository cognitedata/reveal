import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Flex } from '@cognite/cogs.js';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { TOKENS } from '@platypus-app/di';
import {
  ErrorType,
  DataModelVersionStatus,
  DataModelVersion,
  Result,
} from '@platypus/platypus-core';

import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { useDataModelState } from '../../hooks/useDataModelState';
import { SchemaEditorMode } from '../types';
import { BreakingChangesModal } from '../components/BreakingChangesModal';
import { EditorPanel } from '../components/EditorPanel';
import { DataModelHeader } from '../components/DataModelHeader';
import {
  PageToolbar,
  Size,
} from '@platypus-app/components/PageToolbar/PageToolbar';
import { SchemaVisualizer } from '@platypus-app/components/SchemaVisualizer/SchemaVisualizer';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { ErrorBoundary } from '@platypus-app/components/ErrorBoundary/ErrorBoundary';
import { ErrorPlaceholder } from '../components/ErrorBoundary/ErrorPlaceholder';
import { useLocalDraft } from '@platypus-app/modules/solution/data-model/hooks/useLocalDraft';
import { useInjection } from '@platypus-app/hooks/useInjection';
import {
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import { useQueryClient } from 'react-query';
import { Mixpanel, TRACKING_TOKENS } from '@platypus-app/utils/mixpanel';

export interface DataModelPageProps {
  dataModelExternalId: string;
}

export const DataModelPage = ({ dataModelExternalId }: DataModelPageProps) => {
  const history = useHistory();

  const { t } = useTranslation('SolutionDataModel');

  const { data: dataModelVersions, refetch: refetchDataModelVersions } =
    useDataModelVersions(dataModelExternalId);
  const queryClient = useQueryClient();
  const { currentTypeName, editorMode, graphQlSchema, selectedVersionNumber } =
    useSelector<DataModelState>((state) => state.dataModel);
  const { setEditorMode, setGraphQlSchema, setIsDirty, setBuiltInTypes } =
    useDataModelState();
  const { setLocalDraft, removeLocalDraft, getLocalDraft } =
    useLocalDraft(dataModelExternalId);

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId
  );
  const latestDataModelVersion = useSelectedDataModelVersion(
    DEFAULT_VERSION_PATH,
    dataModelVersions || [],
    dataModelExternalId
  );
  const localDraft = getLocalDraft(selectedDataModelVersion.version);

  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isInit, setInit] = useState(false);
  const [breakingChanges, setBreakingChanges] = useState('');

  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const dataModelVersionHandler = useInjection(TOKENS.dataModelVersionHandler);

  /*
  If in view mode and there are no published versions, set to edit mode. This should
  only happen on mount and we can avoid using an effect here because that would involve
  a wasted render.
  */
  if (editorMode === SchemaEditorMode.View && dataModelVersions?.length === 0) {
    setEditorMode(SchemaEditorMode.Edit);
  }

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    dataModelTypeDefsBuilder.clear();

    history.replace(
      `/data-models/${dataModelExternalId}/${dataModelVersion.version}/data`
    );
  };

  // Use this hook as init livecycle
  useEffect(() => {
    if (!isInit) {
      setBuiltInTypes(dataModelTypeDefsBuilder.getBuiltinTypes());
      dataModelTypeDefsBuilder.clear();
      if (localDraft) {
        setGraphQlSchema(localDraft.schema);
        setEditorMode(SchemaEditorMode.Edit);

        if (latestDataModelVersion.schema !== localDraft.schema) {
          setIsDirty(true);
        }
      } else {
        setEditorMode(
          selectedDataModelVersion.status === DataModelVersionStatus.DRAFT
            ? SchemaEditorMode.Edit
            : SchemaEditorMode.View
        );
        setGraphQlSchema(selectedDataModelVersion.schema);
        setIsDirty(false);
      }

      setInit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataModelVersion, isInit]);

  const handleSaveOrPublish = async () => {
    try {
      const publishNewVersion =
        breakingChanges || !dataModelVersions || dataModelVersions.length === 0;
      let version = selectedDataModelVersion?.version;
      const draftVersion = version;
      let result: Result<DataModelVersion>;

      if (publishNewVersion) {
        setUpdating(true);
        version = dataModelVersions?.length
          ? (parseInt(selectedDataModelVersion?.version) + 1).toString()
          : '1';
        result = await dataModelVersionHandler.publish(
          {
            ...selectedDataModelVersion,
            externalId: dataModelExternalId,
            schema: graphQlSchema,
            version: version,
          },
          'NEW_VERSION'
        );
        setBreakingChanges('');
      } else {
        setSaving(true);
        result = await dataModelVersionHandler.publish(
          {
            ...selectedDataModelVersion,
            externalId: dataModelExternalId,
            schema: graphQlSchema,
            version: version,
          },
          'PATCH'
        );
      }

      if ((result.error?.type as ErrorType) === 'BREAKING_CHANGE') {
        setBreakingChanges(result.error.message);
      } else if (result.error?.type as ErrorType) {
        Notification({
          type: 'error',
          title: 'Error: could not update data model',
          message: result.error.message,
          validationErrors: result.error.errors || [],
        });
      }

      if (result.isSuccess) {
        Mixpanel.track(TRACKING_TOKENS.Publishing, {
          dataModel: dataModelExternalId,
        });
        removeLocalDraft(draftVersion);
        setIsDirty(false);

        if (publishNewVersion) {
          // add new version to react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            ['dataModelVersions', dataModelExternalId],
            (oldDataModelVersions = []) => {
              return [...oldDataModelVersions, result.getValue()];
            }
          );
          refetchDataModelVersions();

          history.replace(
            `/data-models/${dataModelExternalId}/${DEFAULT_VERSION_PATH}/data`
          );
        } else {
          // update version in react-query cache and then refetch
          queryClient.setQueryData<DataModelVersion[]>(
            ['dataModelVersions', dataModelExternalId],
            (oldDataModelVersions = []) => {
              return oldDataModelVersions.map((dataModelVersion) => {
                return dataModelVersion.version === version
                  ? result.getValue()
                  : dataModelVersion;
              });
            }
          );
          refetchDataModelVersions();
        }

        Notification({
          type: 'success',
          title: t(
            `data_model_${
              publishNewVersion ? 'published' : 'updated'
            }_toast_title`,
            `Data model ${publishNewVersion ? 'published' : 'updated'}`
          ),
          message: `${t('version', 'Version')} ${version} ${t(
            'of_your_data_model_was_successfully',
            'of your data model was successfully'
          )} ${
            publishNewVersion
              ? t('published', 'published')
              : t('updated', 'updated')
          }.`,
        });
        // Must be located here for fetching versions correctly and updating schema version selector.
        //
        setEditorMode(SchemaEditorMode.View);
      }
    } catch (error) {
      Notification({
        type: 'error',
        title: 'Error: could not save data model',
        message: t(
          'schema_save_error',
          `Saving of the data model failed. ${error}`
        ),
      });
    }
    // Must be located here to work correctly with Promt.
    setUpdating(false);
    setSaving(false);
  };

  const onSchemaChanged = useCallback(
    (schemaString) => {
      if (isInit) {
        // update local storage only when schema is changed
        if (selectedDataModelVersion.schema !== schemaString) {
          setIsDirty(selectedDataModelVersion.schema !== schemaString);

          setLocalDraft({
            ...selectedDataModelVersion,
            schema: schemaString,
            status: DataModelVersionStatus.DRAFT,
          });
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDataModelVersion, isInit]
  );

  const handleDiscardClick = () => {
    dataModelTypeDefsBuilder.clear();
    setInit(false);
  };

  // TODO need this?
  useEffect(() => {
    if (editorMode === SchemaEditorMode.Edit) {
      onSchemaChanged(graphQlSchema);
    }
  }, [graphQlSchema, editorMode, onSchemaChanged]);

  return (
    <>
      <PageContentLayout>
        <PageContentLayout.Header>
          <DataModelHeader
            dataModelExternalId={dataModelExternalId}
            dataModelVersions={dataModelVersions}
            isSaving={saving}
            isUpdating={updating}
            latestDataModelVersion={latestDataModelVersion}
            localDraft={localDraft}
            onDiscardClick={handleDiscardClick}
            onPublishClick={handleSaveOrPublish}
            title={t('data_model_title', 'Data model')}
            onDataModelVersionSelect={handleDataModelVersionSelect}
            selectedDataModelVersion={selectedDataModelVersion}
          />
        </PageContentLayout.Header>
        <PageContentLayout.Body style={{ flexDirection: 'row' }}>
          {isInit ? (
            <SplitPanelLayout
              sidebar={
                <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
                  <EditorPanel
                    editorMode={editorMode}
                    externalId={dataModelExternalId}
                    isPublishing={saving || updating}
                  />
                </ErrorBoundary>
              }
              sidebarWidth={640}
              sidebarMinWidth={440}
              content={
                <Flex
                  data-testid="Schema_visualization"
                  direction="column"
                  style={{ height: '100%' }}
                >
                  <PageToolbar
                    title={t('preview_title', 'Preview')}
                    size={Size.SMALL}
                  />
                  <ErrorBoundary errorComponent={<ErrorPlaceholder />}>
                    <SchemaVisualizer
                      active={currentTypeName || undefined}
                      graphQLSchemaString={graphQlSchema}
                    />
                  </ErrorBoundary>
                </Flex>
              }
            />
          ) : (
            <Spinner />
          )}
        </PageContentLayout.Body>
      </PageContentLayout>

      {breakingChanges && (
        <BreakingChangesModal
          breakingChanges={breakingChanges}
          onCancel={() => setBreakingChanges('')}
          onUpdate={() => {
            handleSaveOrPublish();
            Mixpanel.track(TRACKING_TOKENS.BreakingChanges, {
              dataModel: dataModelExternalId,
            });
          }}
          isUpdating={updating}
        />
      )}
    </>
  );
};
