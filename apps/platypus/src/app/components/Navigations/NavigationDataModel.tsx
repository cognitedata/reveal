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
} from './elements';
import { useDataModel } from '@platypus-app/hooks/useDataModelActions';

export const NavigationDataModel = () => {
  const { dataModelExternalId } = useParams<{
    dataModelExternalId: string;
  }>();
  const { data: dataModel } = useDataModel(dataModelExternalId);

  const history = useHistory();

  const renderTopBarRight = () => {
    return (
      <StyledTopBarRight>
        <Tooltip placement="bottom" content="WIP..." arrow={false}>
          <StyledButton icon="Settings" aria-label="Settings" />
        </Tooltip>
      </StyledTopBarRight>
    );
  };

  const renderTitleButton = () => {
    return (
      <StyledTopBarLeft>
        <StyledFlex alignItems="center">
          <Tooltip content="Go Back to data model list page">
            <StyledTitleButton
              variant="ghost"
              icon="ArrowLeft"
              iconPlacement="left"
              aria-label="Go Back to data model list page"
              onClick={() => history.push('/data-models')}
              data-cy="back-to-all-models-btn"
            />
          </Tooltip>
          <StyledTitle level="2">{dataModel?.name}</StyledTitle>
        </StyledFlex>
      </StyledTopBarLeft>
    );
  };

  return (
    <StyledTopBar>
      {renderTitleButton()}
      {renderTopBarRight()}
    </StyledTopBar>
  );
};
