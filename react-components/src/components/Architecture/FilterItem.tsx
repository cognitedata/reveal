import { type ReactElement } from 'react';
import { SelectPanel } from '@cognite/cogs-lab';
import styled from 'styled-components';
import { type Color } from 'three';
import { type BaseFilterItemCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { useCommandProps } from './hooks/useCommandProps';

export const FilterItem = ({ command }: { command: BaseFilterItemCommand }): ReactElement => {
  const { uniqueId, isVisible, isEnabled, isChecked } = useCommandProps(command);
  if (!isVisible) {
    return <></>;
  }
  return (
    <SelectPanel.Item
      key={uniqueId}
      disabled={!isEnabled}
      checked={isChecked}
      variant="checkbox"
      trailingContent={
        <CenteredContainer>
          {command.color !== undefined && <ColorBox backgroundColor={command.color} />}
        </CenteredContainer>
      }
      onClick={() => {
        command.invoke();
      }}
      label={command.label}
    />
  );
};

const ColorBox = styled.div<{ backgroundColor: Color }>`
  width: 16px;
  height: 16px;
  display: inline-block;
  border-radius: 4px;
  background-color: ${(props) => props.backgroundColor.getStyle()};
`;

const CenteredContainer = styled.div`
  padding: 0px 1px;
  display: flex;
  row-gap: 3px;
  gap: 4px;
  align-items: center;
`;
