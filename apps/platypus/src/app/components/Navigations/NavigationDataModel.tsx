import { useHistory, useParams } from 'react-router-dom';
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

export const NavigationDataModel = () => {
  const { dataModelExternalId } = useParams<{
    dataModelExternalId: string;
  }>();
  const { data: dataModel } = useDataModel(dataModelExternalId);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const history = useHistory();

  const renderTopBarRight = () => {
    return (
      <StyledTopBarRight>
        <StyledButton
          icon="Settings"
          aria-label="Settings"
          onClick={() => setIsSettingsModalVisible(true)}
        />
      </StyledTopBarRight>
    );
  };

  const renderTitleButton = () => {
    return (
      <StyledTopBarLeft>
        <StyledFlex alignItems="center">
          <Tooltip content="Go Back to data model list page">
            <StyledTitleButton
              type="ghost"
              icon="ArrowLeft"
              iconPlacement="left"
              aria-label="Go Back to data model list page"
              onClick={() => history.push('/data-models')}
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
          {isSettingsModalVisible && (
            <DataModelSettingsModal
              dataModel={dataModel}
              onRequestClose={() => setIsSettingsModalVisible(false)}
            />
          )}
        </>
      )}
    </StyledTopBar>
  );
};
