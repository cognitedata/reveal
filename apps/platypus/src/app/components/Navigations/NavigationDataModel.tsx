import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { DataModelVersion } from '@platypus/platypus-core';

import {
  Button,
  Chip,
  Divider,
  Dropdown,
  Flex,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';

import { DOCS_LINKS } from '../../constants';
import { TOKENS } from '../../di';
import { useNavigate } from '../../flags/useNavigate';
import {
  useDataModel,
  useDataModelVersions,
} from '../../hooks/useDataModelActions';
import { useInjection } from '../../hooks/useInjection';
import { useMixpanel } from '../../hooks/useMixpanel';
import { useSelectedDataModelVersion } from '../../hooks/useSelectedDataModelVersion';
import useSelector from '../../hooks/useSelector';
import { useTranslation } from '../../hooks/useTranslation';
import { useDraftRows } from '../../modules/solution/data-management/hooks/useDraftRows';
import { EndpointModal } from '../../modules/solution/data-model/components/EndpointModal';
import { PowerBIModal } from '../../modules/solution/data-model/components/PowerBIModal';
import { useLocalDraft } from '../../modules/solution/data-model/hooks/useLocalDraft';
import { SchemaEditorMode } from '../../modules/solution/data-model/types';
import { useDataModelState } from '../../modules/solution/hooks/useDataModelState';
import { DataModelState } from '../../redux/reducers/global/dataModelReducer';
import { DEFAULT_VERSION_PATH } from '../../utils/config';
import { DataModelSettingsModal } from '../DataModelSettingsModal/DataModelSettingsModal';
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
  const [showPowerBIModal, setShowPowerBIModal] = useState(false);

  const docsLinkUrl =
    currentPage === 'preview' ? DOCS_LINKS.QUERYING : DOCS_LINKS.CREATION;

  const renderTopBarRight = () => {
    return (
      <StyledTopBarRight style={{ gap: 8 }}>
        <Tooltip content={t('cli_PowerBI_tooltip', 'Power BI Connection Info')}>
          <Button
            icon="Link"
            data-cy="btn-endpoint-modal"
            onClick={() => {
              track('DataModel.Links.PowerBI');
              setShowPowerBIModal(true);
            }}
          >
            {t('powerbi_link_button', 'Power BI')}
          </Button>
        </Tooltip>
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
            </Menu>
          }
        >
          <Button icon="EllipsisVertical" aria-label="Overflow Menu" />
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
      {showPowerBIModal && (
        <PowerBIModal
          dataModel={selectedDataModelVersion}
          onRequestClose={() => setShowPowerBIModal(false)}
        />
      )}
      {showEndpointModal && (
        <EndpointModal
          endpoint={fdmClient.getQueryEndpointUrl(selectedDataModelVersion)}
          onRequestClose={() => setShowEndpointModal(false)}
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
