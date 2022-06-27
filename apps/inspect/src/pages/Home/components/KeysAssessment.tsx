import { Button, Icon, Input, Tooltip } from '@cognite/cogs.js';
import * as React from 'react';
import styled from 'styled-components';

import { Tag } from './Tag';

interface ItemProps {
  name: string;
  value: string;
  handleEdit: (name: string, value: string) => void;
}
const Item: React.FC<ItemProps> = ({ name, value, handleEdit }) => {
  const [edit, setEdit] = React.useState(false);
  const [localValue, setValue] = React.useState(value);

  return (
    <Card className="z-4">
      <Actions>
        <Tooltip content="Incorrect match on value? Help us correct the value">
          <Button
            icon="Edit"
            type={edit ? 'primary' : 'ghost'}
            onClick={() => {
              setEdit((prevState) => !prevState);
              if (edit) {
                handleEdit(name, localValue);
              }
            }}
          />
        </Tooltip>
        <Tooltip content="Incorrect matching of value? Remove it so it wont be matched again">
          <Button icon="Delete" type="ghost-danger" aria-label="Delete" />
        </Tooltip>
      </Actions>

      <Content>
        <Tag>{name}</Tag> <Icon type="ArrowDown" />
        {edit ? (
          <Input
            placeholder="Change value"
            value={localValue}
            onChange={(e) => setValue(e.target.value)}
          />
        ) : (
          <Tag color="success" icon="CheckmarkAlternative">
            {localValue}
          </Tag>
        )}
      </Content>
    </Card>
  );
};

interface KeysAssessmentProps {
  keys: Record<string, string>;
  handleEdit: (name: string, value: string) => void;
}
export const KeysAssessment: React.FC<KeysAssessmentProps> = ({
  keys,
  handleEdit,
}) => {
  return (
    <Container>
      {Object.entries(keys).map((value) => {
        return (
          <Item
            handleEdit={handleEdit}
            key={value[0]}
            name={value[0]}
            value={value[1] as string}
          />
        );
      })}
    </Container>
  );
};

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Container = styled.div`
  margin-top: 24px;
  position: sticky;
  top: 24px;
`;

export const Content = styled.div`
  display: flex;
  margin-top: 8px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  flex-wrap: wrap;
  height: 100%;
  gap: 8px;
  .cogs-icon-ArrowRight {
    margin-right: 4px;
  }
`;

export const Card = styled.div`
  width: 250px;
  border-radius: 8px;
  border-radius: 8px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
  background-color: #33333308;
  margin-bottom: 16px;
`;
