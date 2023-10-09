import {
  DataModelVersion,
  DataModelVersionStatus,
} from '@platypus/platypus-core';

import { Button, Flex, Chip, Tooltip } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { VersionSelectorToolbar } from '../../../../../components/VersionSelectorToolbar';
import config from '../../../../../config/config';
import { useCapabilities } from '../../../../../hooks/useCapabilities';
import { useMixpanel } from '../../../../../hooks/useMixpanel';
import useSelector from '../../../../../hooks/useSelector';
import { useTranslation } from '../../../../../hooks/useTranslation';
import { DataModelState } from '../../../../../redux/reducers/global/dataModelReducer';
import { useDataModelState } from '../../../hooks/useDataModelState';
import { useLocalDraft } from '../../hooks/useLocalDraft';
import { SchemaEditorMode } from '../../types';

import { DiscardButton, ReturnButton, ImportTypesButton } from './elements';

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
  onImportTypesClick: () => void;
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
  onImportTypesClick,
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

  const { isEnabled: isImportTypeEnabled } = useFlag('data-type-import', {
    fallback: false,
  });
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

  const { removeLocalDraft, setLocalDraft } = useLocalDraft(
    dataModelExternalId,
    dataModelSpace,
    latestDataModelVersion
  );

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

          {isImportTypeEnabled && (
            <ImportTypesButton
              type="secondary"
              data-cy="import-types-btn"
              onClick={() => onImportTypesClick()}
              style={{ marginRight: '10px' }}
            >
              {t('import_types', 'Import types')}
            </ImportTypesButton>
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
      </Flex>
    );
  };

  return (
    <VersionSelectorToolbar title={title || ''}>
      {renderTools()}
    </VersionSelectorToolbar>
  );
};
