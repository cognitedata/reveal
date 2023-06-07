import { Operation } from '@cognite/calculation-backend';
import { Icon, Menu } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { sortBy } from 'lodash';
import compareVersions from 'compare-versions';

const FunctionsList = ({
  category,
  operations,
  onFunctionClick,
  onInfoButtonClick,
}: {
  category: string;
  operations: Operation[];
  onFunctionClick: (event: React.MouseEvent, operation: Operation) => void;
  onInfoButtonClick: (operation: Operation) => void;
}) => {
  const sortedToolFunctionsByName = sortBy(operations, ['name']);

  return (
    <>
      <Menu.Header>{category}</Menu.Header>
      {sortedToolFunctionsByName.filter(Boolean).map((operation) => {
        const latestVersionOfOperation = operation.versions
          .slice()
          .sort((a, b) => compareVersions(b.version, a.version))[0]!;

        return (
          <Menu.Item
            key={latestVersionOfOperation.name}
            onClick={(e) => onFunctionClick(e, operation)}
            style={{ minHeight: 40 }}
          >
            <FunctionNameWrapper>
              <span style={{ textAlign: 'left' }}>
                {latestVersionOfOperation.name}
              </span>
              {latestVersionOfOperation.description && (
                <InfoButton
                  type="Info"
                  id={`${operation.op}-info-button`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onInfoButtonClick(operation);
                  }}
                />
              )}
            </FunctionNameWrapper>
          </Menu.Item>
        );
      })}
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
