import { useTranslation } from '@platypus-app/hooks/useTranslation';
import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus/platypus-core';
import { DiscardButton, DocLinkWrapper, ReturnButton } from './elements';
import { SchemaEditorMode } from '@platypus-app/modules/solution/data-model/types';
import { Button, Flex, Chip, Tooltip } from '@cognite/cogs.js';
import { useLocalDraft } from '@platypus-app/modules/solution/data-model/hooks/useLocalDraft';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { VersionSelectorToolbar } from '@platypus-app/components/VersionSelectorToolbar';
import { useDataModelState } from '@platypus-app/modules/solution/hooks/useDataModelState';
import { DocLinkButtonGroup } from '@platypus-app/components/DocLinkButtonGroup/DocLinkButtonGroup';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { useCapabilities } from '@platypus-app/hooks/useCapabilities';
import config from '@platypus-app/config/config';
import { DOCS_LINKS } from '@platypus-app/constants';

export interface DataModelHeaderProps {
  dataModelExternalId: string;
  dataModelSpace: string;
  dataModelVersions: DataModelVersion[] | undefined;
  isSaving: boolean;
  isUpdating: boolean;
  editorHasError: boolean;
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
  dataModelSpace,
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
  editorHasError,
}: DataModelHeaderProps) => {
  const { t } = useTranslation('DataModelHeader');

  const dataModelsWriteAcl = useCapabilities('dataModelsAcl', ['WRITE'], {
    space: dataModelSpace,
    checkAll: false,
  });

  const { track } = useMixpanel();
  const { editorMode, graphQlSchema, isDirty } = useSelector<DataModelState>(
    (state) => state.dataModel
  );
  const {
    setCurrentTypeName,
    setEditorMode,
    updateGraphQlSchema,
    setIsDirty,
    setSelectedDataModelVersion,
    switchDataModelVersion,
  } = useDataModelState();

  const { getRemoteAndLocalSchemas, removeLocalDraft, setLocalDraft } =
    useLocalDraft(dataModelExternalId, dataModelSpace, latestDataModelVersion);

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

  const isDraftOld =
    !!localDraft &&
    parseInt(latestDataModelVersion.version, 10) >
      parseInt(localDraft.version, 10);

  const handleEditClick = () => {
    if (localDraft) {
      updateGraphQlSchema(localDraft.schema);
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
    setSelectedDataModelVersion(latestDataModelVersion);

    track('DataModel.Draft.Delete', {
      dataModel: dataModelExternalId,
    });

    onDiscardClick();
  };

  const handleReturnToLatestClick = () => {
    handleDataModelVersionSelect(latestDataModelVersion);
  };

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    switchDataModelVersion(dataModelVersion);
    onDataModelVersionSelect(dataModelVersion);
  };

  const docLink = (
    <DocLinkWrapper>
      <DocLinkButtonGroup docsLinkUrl={DOCS_LINKS.CREATION} />
    </DocLinkWrapper>
  );

  const renderTools = () => {
    if (editorMode === SchemaEditorMode.Edit) {
      return (
        <div data-cy="data-model-toolbar-actions" style={{ display: 'flex' }}>
          {isDraftOld && (
            <Flex alignItems="center" style={{ marginRight: '8px' }}>
              <Tooltip
                position="bottom"
                content={`Version v. ${latestDataModelVersion.version} has been published by another user, and this draft is currently based on an outdated version.`}
              >
                <Chip
                  size="medium"
                  type="warning"
                  label={t(
                    'outdated_draft_version_warning',
                    `Your draft is based on an outdated version`
                  )}
                />
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
              editorHasError
            }
            style={{ marginRight: '8px' }}
          >
            {t('publish', 'Publish')}
          </Button>
          {docLink}
        </div>
      );
    }

    if (selectedDataModelVersion.version !== latestDataModelVersion.version) {
      return (
        <Flex style={{ flexGrow: 1 }}>
          <Flex
            className="cogs-body-2 strong"
            style={{
              backgroundColor: 'var(--cogs-border--status-warning--muted)',
              borderRadius: '6px',
              flexGrow: 1,
              height: '36px',
              marginLeft: '8px',
              marginRight: '8px',
              padding: '0 0 0 12px',
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
          {docLink}
        </Flex>
      );
    }

    return (
      <Flex>
        <Tooltip
          disabled={dataModelsWriteAcl.isAclSupported}
          content={t(
            'edit_data_model_disabled_text',
            `Missing "${config.DATA_MODELS_ACL}.write" permission`
          )}
        >
          <Button
            type="primary"
            data-cy="edit-schema-btn"
            onClick={handleEditClick}
            className="editButton"
            disabled={!dataModelsWriteAcl.isAclSupported}
            style={{ minWidth: '140px', marginRight: '8px' }}
          >
            {t('edit_data_model', 'Edit data model')}
          </Button>
        </Tooltip>
        {docLink}
      </Flex>
    );
  };

  return (
    <VersionSelectorToolbar
      title={title || ''}
      schemas={getDataModelHeaderSchemas()}
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
