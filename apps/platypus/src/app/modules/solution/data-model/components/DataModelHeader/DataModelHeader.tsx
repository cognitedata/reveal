import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus/platypus-core';
import { DiscardButton, ReturnButton } from './elements';
import { SchemaEditorMode } from '@platypus-app/modules/solution/data-model/types';
import { Button, Flex, Label, Tooltip } from '@cognite/cogs.js';
import { useLocalDraft } from '@platypus-app/modules/solution/data-model/hooks/useLocalDraft';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';
import { VersionSelectorToolbar } from '@platypus-app/components/VersionSelectorToolbar';
import { useDataModelState } from '@platypus-app/modules/solution/hooks/useDataModelState';
import { Mixpanel, TRACKING_TOKENS } from '@platypus-app/utils/mixpanel';

export interface DataModelHeaderProps {
  dataModelExternalId: string;
  dataModelVersions: DataModelVersion[] | undefined;
  isSaving: boolean;
  isUpdating: boolean;
  latestDataModelVersion: DataModelVersion;
  localDraft: DataModelVersion | null | undefined;
  onDiscardClick: () => void;
  onPublishClick: () => void;
  onDataModelVersionSelect: (schema: DataModelVersion) => void;
  selectedDataModelVersion: DataModelVersion;
  title: string;
}

export const DataModelHeader = ({
  dataModelExternalId,
  dataModelVersions,
  isSaving,
  isUpdating,
  latestDataModelVersion,
  localDraft,
  onDiscardClick,
  onPublishClick,
  onDataModelVersionSelect,
  selectedDataModelVersion,
  title,
}: DataModelHeaderProps) => {
  const { t } = useTranslation('DataModelHeader');

  const { editorMode, graphQlSchema, isDirty, typeFieldErrors } =
    useSelector<DataModelState>((state) => state.dataModel);
  const {
    parseGraphQLSchema,
    setCurrentTypeName,
    setEditorMode,
    setGraphQlSchema,
    setIsDirty,
    setSelectedVersionNumber,
  } = useDataModelState();

  const { getRemoteAndLocalSchemas, removeLocalDraft, setLocalDraft } =
    useLocalDraft(dataModelExternalId);

  const getDataModelHeaderSchemas = () => {
    /*
    if there's neither a draft nor any published data model versions, for example when
    we're in a newly created data model, return an array with a default data model version
    */
    if (!localDraft && dataModelVersions?.length === 0) {
      return [selectedDataModelVersion];
    } else {
      return getRemoteAndLocalSchemas(dataModelVersions || []);
    }
  };

  const isDraftSaved = isDirty && Object.keys(typeFieldErrors).length === 0;
  const isDraftOld =
    !!localDraft &&
    parseInt(latestDataModelVersion.version, 10) >
      parseInt(localDraft.version, 10);

  const handleEditClick = () => {
    if (localDraft) {
      setGraphQlSchema(localDraft.schema);
    } else {
      setLocalDraft({
        ...selectedDataModelVersion,
        status: DataModelVersionStatus.DRAFT,
      });
    }

    setEditorMode(SchemaEditorMode.Edit);
  };

  const handleDiscardClick = () => {
    // if there is no published version yet, stay in edit mode
    if (dataModelVersions && dataModelVersions.length > 0) {
      setEditorMode(SchemaEditorMode.View);
    }
    if (localDraft) {
      removeLocalDraft(localDraft.version);
    }
    setIsDirty(false);
    setCurrentTypeName(null);
    setSelectedVersionNumber(DEFAULT_VERSION_PATH);

    Mixpanel.track(TRACKING_TOKENS.Discard, {
      dataModel: dataModelExternalId,
    });

    onDiscardClick();
  };

  const handleReturnToLatestClick = () => {
    handleDataModelVersionSelect(latestDataModelVersion);
  };

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    setGraphQlSchema(dataModelVersion.schema);
    parseGraphQLSchema(dataModelVersion.schema);
    setIsDirty(false);
    setCurrentTypeName(null);
    setSelectedVersionNumber(dataModelVersion.version);
    setEditorMode(
      dataModelVersion.status === DataModelVersionStatus.DRAFT
        ? SchemaEditorMode.Edit
        : SchemaEditorMode.View
    );

    Mixpanel.track(TRACKING_TOKENS.SelectDM, {
      dataModel: dataModelExternalId,
      version: dataModelVersion.version,
    });

    onDataModelVersionSelect(dataModelVersion);
  };

  const renderTools = () => {
    if (editorMode === SchemaEditorMode.Edit) {
      return (
        <div data-cy="data-model-toolbar-actions" style={{ display: 'flex' }}>
          {isDraftOld && (
            <Flex alignItems={'center'} style={{ marginRight: '8px' }}>
              <Tooltip
                position="bottom"
                content={`Version v. ${latestDataModelVersion.version} has been published by another user, and this draft is currently based on an outdated version.`}
              >
                <Label size="medium" variant="warning">
                  {t(
                    'outdated_draft_version_warning',
                    `Your draft is based on an outdated version`
                  )}
                </Label>
              </Tooltip>
            </Flex>
          )}

          <DiscardButton
            type="secondary"
            data-cy="discard-btn"
            disabled={isSaving || isUpdating}
            onClick={handleDiscardClick}
            style={{ marginRight: '10px' }}
          >
            {t('discard_changes', 'Discard changes')}
          </DiscardButton>

          <Button
            type="primary"
            data-cy="publish-schema-btn"
            onClick={onPublishClick}
            loading={isSaving || isUpdating}
            disabled={
              !isDirty ||
              !graphQlSchema ||
              selectedDataModelVersion.schema === graphQlSchema ||
              Object.keys(typeFieldErrors).length !== 0
            }
          >
            {t('publish', 'Publish')}
          </Button>
        </div>
      );
    }

    if (selectedDataModelVersion.version !== latestDataModelVersion.version) {
      return (
        <Flex
          className="cogs-body-2 strong"
          style={{
            backgroundColor: 'var(--cogs-border--status-warning--muted)',
            borderRadius: '6px',
            flexGrow: 1,
            height: '36px',
            marginLeft: '8px',
            padding: '0 12px',
          }}
        >
          <Flex
            alignItems="center"
            justifyContent="space-between"
            style={{ flexGrow: 1 }}
          >
            {t('viewing_older_version', 'You are viewing an older version')}
            <ReturnButton
              data-cy="return-to-latest-btn"
              iconPlacement="left"
              icon="Reply"
              onClick={handleReturnToLatestClick}
            >
              {t('return_to_latest', 'Return to latest')}
            </ReturnButton>
          </Flex>
        </Flex>
      );
    }

    return (
      <Button
        type="primary"
        data-cy="edit-schema-btn"
        onClick={handleEditClick}
        className="editButton"
        style={{ minWidth: '140px' }}
      >
        {t('edit_data_model', 'Edit data model')}
      </Button>
    );
  };

  return (
    <VersionSelectorToolbar
      title={title || ''}
      schemas={getDataModelHeaderSchemas()}
      draftSaved={isDraftSaved}
      onDataModelVersionSelect={handleDataModelVersionSelect}
      selectedDataModelVersion={
        editorMode === SchemaEditorMode.Edit && localDraft
          ? localDraft
          : selectedDataModelVersion
      }
    >
      {renderTools()}
    </VersionSelectorToolbar>
  );
};
