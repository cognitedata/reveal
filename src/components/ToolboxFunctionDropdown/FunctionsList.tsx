import { Operation } from '@cognite/calculation-backend';
import { Icon, Menu } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { sortBy } from 'lodash';

const FunctionsList = ({
  category,
  toolFunctions,
  onFunctionClick,
  onInfoButtonClick,
}: {
  category: string;
  toolFunctions: Operation[];
  onFunctionClick: (event: React.MouseEvent, func: Operation) => void;
  onInfoButtonClick: (func: Operation) => void;
}) => {
  const sortedToolFunctionsByName = sortBy(toolFunctions, ['name']);
  return (
    <>
      <Menu.Header>{category}</Menu.Header>
      {sortedToolFunctionsByName.filter(Boolean).map((func) => (
        <Menu.Item
          key={func.name}
          onClick={(e) => onFunctionClick(e, func)}
          style={{ minHeight: 40 }}
        >
          <FunctionNameWrapper>
            <span style={{ textAlign: 'left' }}>{func.name}</span>
            {func.description && (
              <InfoButton
                type="Info"
                id={`${func.op}-info-button`}
                onClick={(e) => {
                  e.stopPropagation();
                  onInfoButtonClick(func);
                }}
              />
            )}
          </FunctionNameWrapper>
        </Menu.Item>
      ))}
    </>
  );
};

const FunctionNameWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  span {
    line-height: 28px;
  }
`;

const InfoButton = styled(Icon)`
  margin-left: 10px;
`;

export default FunctionsList;
