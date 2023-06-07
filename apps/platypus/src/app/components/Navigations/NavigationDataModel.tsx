import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { DataModelVersion } from '@platypus/platypus-core';
import { DataModelSettingsModal } from '@platypus-app/components/DataModelSettingsModal/DataModelSettingsModal';
import { DOCS_LINKS } from '@platypus-app/constants';
import { TOKENS } from '@platypus-app/di';
import { useNavigate } from '@platypus-app/flags/useNavigate';
import {
  useDataModel,
  useDataModelVersions,
} from '@platypus-app/hooks/useDataModelActions';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import useSelector from '@platypus-app/hooks/useSelector';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { useDraftRows } from '@platypus-app/modules/solution/data-management/hooks/useDraftRows';
import { EndpointModal } from '@platypus-app/modules/solution/data-model/components/EndpointModal';
import { useLocalDraft } from '@platypus-app/modules/solution/data-model/hooks/useLocalDraft';
import { SchemaEditorMode } from '@platypus-app/modules/solution/data-model/types';
import { useDataModelState } from '@platypus-app/modules/solution/hooks/useDataModelState';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { DEFAULT_VERSION_PATH } from '@platypus-app/utils/config';

import {
  Button,
  Chip,
  Divider,
  Dropdown,
  Flex,
  Menu,
  NotificationDot,
  Tooltip,
} from '@cognite/cogs.js';

import { FeaturePreview } from '../FeaturePreview/FeaturePreview';
import { SchemaVersionDropdown } from '../SchemaVersionDropdown/SchemaVersionDropdown';

import {
  StyledTitleButton,
  StyledTopBar,
  StyledTopBarLeft,
  StyledTopBarRight,
  StyledTitle,
  StyledFlex,
  StyledExternalId,
} from './elements';

export const NavigationDataModel = () => {
  const currentPage = (() => {
    if (window.location.pathname.endsWith('preview')) {
      return 'preview';
    }
    if (window.location.pathname.endsWith('explorer')) {
      return 'explorer';
    }
    if (window.location.pathname.endsWith('quality')) {
      return 'quality';
    }
    return 'data-modeling';
  })();
  const { dataModelExternalId, space, version } = useParams() as {
    dataModelExternalId: string;
    space: string;
    version: string;
  };
  const { data: dataModel } = useDataModel(dataModelExternalId, space);
  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('data-model-navigation');
  const { track } = useMixpanel();

  const { data: dataModelVersions } = useDataModelVersions(
    dataModelExternalId,
    space
  );

  const fdmClient = useInjection(TOKENS.fdmClient);

  const { dataModelVersion: latestDataModelVersion } =
    useSelectedDataModelVersion(
      DEFAULT_VERSION_PATH,
      dataModelExternalId,
      space
    );

  const { getLocalDraft, getRemoteAndLocalSchemas } = useLocalDraft(
    dataModelExternalId,
    space,
    latestDataModelVersion
  );

  const localDraft = getLocalDraft(selectedDataModelVersion.version);

  const { editorMode } = useSelector<DataModelState>(
    (state) => state.dataModel
  );

  const { clearState } = useDraftRows();
  const { switchDataModelVersion } = useDataModelState();

  const dataModelTypeDefsBuilder = useInjection(
    TOKENS.dataModelTypeDefsBuilderService
  );
  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    let section = '/';
    switch (currentPage) {
      case 'explorer': {
        section = 'query-explorer';
        break;
      }
      case 'preview': {
        section = 'data-management/preview';
        break;
      }
      case 'quality': {
        section = 'data-quality';
        break;
      }
    }
    navigate(
      `/${dataModelVersion.space}/${dataModelExternalId}/${dataModelVersion.version}/${section}`
    );
    switchDataModelVersion(dataModelVersion);
    dataModelTypeDefsBuilder.clear();
    clearState();
  };

  const getDataModelHeaderSchemas = () => {
    // if not on data modeling page, just list proper versions (no drafts)
    if (currentPage !== 'data-modeling') {
      return dataModelVersions || [];
    }
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

  const [showEndpointModal, setShowEndpointModal] = useState(false);
  const [showFeatureToggle, setShowFeatureToggle] = useState(false);

  const docsLinkUrl =
    currentPage === 'preview' ? DOCS_LINKS.QUERYING : DOCS_LINKS.CREATION;

  const renderTopBarRight = () => {
    return (
      <StyledTopBarRight style={{ gap: 8 }}>
        <Tooltip content={t('cli_URL_tooltip', 'GraphQL URL')}>
          <Button
            icon="Link"
            data-cy="btn-endpoint-modal"
            onClick={() => {
              track('DataModel.Links.GraphQL');
              setShowEndpointModal(true);
            }}
          >
            {t('graphql-link-button', 'URL')}
          </Button>
        </Tooltip>
        <Tooltip content={t('cli_docs_tooltip', 'CLI')}>
          <a href={DOCS_LINKS.CLI} target="_blank" rel="noreferrer">
            <Button
              aria-label={t('btn_link_cli_docs', 'CLI docs')}
              onClick={() => {
                track('DataModel.Links.CLI');
              }}
              icon="CLI"
            >
              {t('cli_docs_tooltip', 'CLI')}
            </Button>
          </a>
        </Tooltip>
        <Divider direction="vertical" length="16px" weight="2px" />
        <Dropdown
          hideOnSelect={{
            hideOnContentClick: true,
            hideOnOutsideClick: true,
          }}
          content={
            <Menu>
              <Menu.Item
                icon="Settings"
                iconPlacement="left"
                onClick={() => setIsSettingsModalVisible(true)}
              >
                {t('menu-item-settings', 'Settings')}
              </Menu.Item>
              <Tooltip content={t('docs_docs_tooltip', 'Documentation')}>
                <Menu.Item
                  aria-label={t('btn_link_docs', 'Visit docs page')}
                  icon="Documentation"
                  iconPlacement="left"
                  onClick={() => {
                    track('DataModel.Links.Documentation');
                    window.open(docsLinkUrl, '_blank', 'noreferrer');
                  }}
                >
                  {t('docs_docs_tooltip', 'Documentation')}
                </Menu.Item>
              </Tooltip>
              <Divider />
              <Menu.Item
                icon="Experiment"
                iconPlacement="left"
                style={{
                  background: 'var(--cogs-decorative--gradient--dawn)',
                  color: 'white',
                }}
                onClick={() => {
                  setShowFeatureToggle(true);
                }}
              >
                {t('menu-item-experiments', 'Feature preview')}
              </Menu.Item>
            </Menu>
          }
        >
          <NotificationDot>
            <Button icon="EllipsisVertical" aria-label="Overflow Menu" />
          </NotificationDot>
        </Dropdown>
      </StyledTopBarRight>
    );
  };

  const renderTitleButton = () => {
    return (
      <StyledTopBarLeft>
        <StyledFlex alignItems="center">
          <Tooltip
            content={t(
              'tooltip-header-back',
              'Go back to data model list page'
            )}
          >
            <StyledTitleButton
              type="secondary"
              icon="ArrowLeft"
              iconPlacement="left"
              aria-label="Go Back to data model list page"
              onClick={() => navigate('/')}
              data-cy="back-to-all-models-btn"
            />
          </Tooltip>
          <Flex
            direction="column"
            alignItems="start"
            style={{
              marginLeft: 10,
            }}
          >
            <Flex>
              <StyledTitle level="2" strong>
                {dataModel?.name}
              </StyledTitle>
              <StyledExternalId level="2">{`(${dataModel?.id})`}</StyledExternalId>
            </Flex>
            <Chip
              size="x-small"
              label={space}
              icon="Folder"
              style={{ userSelect: 'all' }}
              tooltipProps={{ content: t('tooltip-space-name', 'Space') }}
            />
          </Flex>
        </StyledFlex>

        {selectedDataModelVersion ? (
          <SchemaVersionDropdown
            onVersionSelect={(solutionSchema) => {
              track('DataModel.Versions.Select', {
                version: solutionSchema.version,
              });
              handleDataModelVersionSelect(solutionSchema);
            }}
            selectedVersion={
              currentPage === 'data-modeling' &&
              editorMode === SchemaEditorMode.Edit &&
              localDraft
                ? localDraft
                : selectedDataModelVersion
            }
            versions={getDataModelHeaderSchemas()}
          />
        ) : null}
      </StyledTopBarLeft>
    );
  };

  return (
    <StyledTopBar>
      {showEndpointModal && (
        <EndpointModal
          endpoint={fdmClient.getQueryEndpointUrl(selectedDataModelVersion)}
          onRequestClose={() => setShowEndpointModal(false)}
        />
      )}
      {showFeatureToggle && (
        <FeaturePreview
          onRequestClose={(hasChanged) => {
            setShowFeatureToggle(false);
            if (hasChanged) {
              window.location.reload();
            }
          }}
        />
      )}

      {dataModel && (
        <>
          {renderTitleButton()}
          {renderTopBarRight()}
          {isSettingsModalVisible && (
            <DataModelSettingsModal
              visible
              dataModel={dataModel}
              onRequestClose={() => setIsSettingsModalVisible(false)}
            />
          )}
        </>
      )}
    </StyledTopBar>
  );
};
