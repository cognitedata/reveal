import { useHistory } from 'react-router-dom';
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
import useSelector from '@platypus-app/hooks/useSelector';

export const NavigationDataModel = () => {
  const dataModelName = useSelector((state) => state.dataModel.dataModel?.name);
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
            />
          </Tooltip>
          <StyledTitle level="2">{dataModelName}</StyledTitle>
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
