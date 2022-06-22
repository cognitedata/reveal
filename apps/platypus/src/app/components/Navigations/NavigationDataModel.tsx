import { useHistory, useParams } from 'react-router-dom';
import { Tooltip } from '@cognite/cogs.js';
import {
  StyledButton,
  StyledTitleButton,
  StyledTopBar,
  StyledTopBarLeft,
  StyledTopBarRight,
} from './elements';

export const NavigationDataModel = () => {
  const { dataModelExternalId } = useParams<{
    dataModelExternalId: string;
  }>();

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
        <StyledTitleButton
          icon="ArrowLeft"
          iconPlacement="left"
          aria-label="Go Back"
          onClick={() => history.push('/data-models')}
        >
          {dataModelExternalId}
        </StyledTitleButton>
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
