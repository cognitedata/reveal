import { useParams } from 'react-router-dom';
import { Tooltip } from '@cognite/cogs.js';
import {
  StyledButton,
  StyledTitleButton,
  StyledTopBar,
  StyledTopBarLeft,
  StyledTopBarRight,
  StyledTitle,
  StyledFlex,
  StyledExternalId,
} from './elements';
import { useDataModel } from '@platypus-app/hooks/useDataModelActions';
import { useState } from 'react';
import { DataModelSettingsModal } from '@platypus-app/components/DataModelSettingsModal/DataModelSettingsModal';
import { useNavigate } from '@platypus-app/flags/useNavigate';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export const NavigationDataModel = () => {
  const { dataModelExternalId, space } = useParams();
  const { data: dataModel } = useDataModel(dataModelExternalId!, space!);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('data-model-navigation');

  const renderTopBarRight = () => {
    return (
      <StyledTopBarRight>
        <Tooltip content={t('tooltip-settings', 'Data model settings')}>
          <StyledButton
            icon="Settings"
            aria-label="Settings"
            onClick={() => setIsSettingsModalVisible(true)}
          />
        </Tooltip>
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
              type="ghost"
              icon="ArrowLeft"
              iconPlacement="left"
              aria-label="Go Back to data model list page"
              onClick={() => navigate('/')}
              data-cy="back-to-all-models-btn"
            />
          </Tooltip>
          <StyledTitle level="2" strong>
            {dataModel?.name}
          </StyledTitle>
          <StyledExternalId level="2">{`[${dataModel?.id}]`}</StyledExternalId>
        </StyledFlex>
      </StyledTopBarLeft>
    );
  };

  return (
    <StyledTopBar>
      {dataModel && (
        <>
          {renderTitleButton()}
          {renderTopBarRight()}
          <DataModelSettingsModal
            visible={isSettingsModalVisible}
            dataModel={dataModel}
            onRequestClose={() => setIsSettingsModalVisible(false)}
          />
        </>
      )}
    </StyledTopBar>
  );
};
