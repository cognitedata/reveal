import React from 'react';
import { A, Button, Body, Input, Select, Title, Micro } from '@cognite/cogs.js';
import {
  SelectLabel,
  SelectContainer,
  FormContainer,
  BoardsContainer,
  AddedBoardItem,
  StyledCheckIcon,
  StyledDeleteIcon,
} from 'components/modals/elements';
import { Flex, SpaceBetween } from 'styles/common';
import { Board } from 'store/suites/types';

interface Props {
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleBoardTypeChange: any;
  handleSubmit: () => void;
  addNewBoard: () => void;
  boards: any;
  boardValues: any;
  boardType: any;
  buttonNames: any;
  mode: any;
  setNewBoard: any;
}

const options = [
  { value: 'grafana', label: 'Grafana' },
  { value: 'powerbi', label: 'PowerBI' },
  { value: 'plotly', label: 'Plotly' },
  { value: 'other', label: 'Other' },
];

export const AddBoard: React.FC<Props> = ({
  handleOnChange,
  handleBoardTypeChange,
  handleSubmit,
  addNewBoard,
  boards,
  boardValues,
  boardType,
  buttonNames,
  mode,
  setNewBoard,
}: Props) => {
  return (
    <>
      <Flex>
        <FormContainer>
          <Input
            autoComplete="off"
            title="Title"
            name="title"
            value={boardValues.title}
            variant="noBorder"
            placeholder="Title"
            onChange={handleOnChange}
            fullWidth
          />
          <SelectContainer>
            <SelectLabel>Select type</SelectLabel>
            <Select
              theme="grey"
              placeholder="Select type"
              name="type"
              value={options.find((o) => o.value === boardType)}
              onChange={handleBoardTypeChange}
              options={options}
            />
          </SelectContainer>
          <Input
            autoComplete="off"
            title="URL"
            name="url"
            value={boardValues.url}
            variant="noBorder"
            placeholder="URL"
            onChange={handleOnChange}
            fullWidth
          />
          <Input
            autoComplete="off"
            title="Iframe snapshot"
            name="embedTag"
            value={boardValues.embedTag}
            variant="noBorder"
            placeholder="Tag"
            onChange={handleOnChange}
            fullWidth
          />
          <Button type="secondary" onClick={addNewBoard}>
            {buttonNames[mode].board}
          </Button>
        </FormContainer>
        <BoardsContainer>
          <Title level={4}>Added boards</Title>
          {boards?.map((board: Board) => {
            return (
              <AddedBoardItem
                onClick={() => {
                  setNewBoard(board);
                }}
                key={board.key}
              >
                <StyledCheckIcon type="Check" />
                <Body level={4}>{board.title}</Body>
                <StyledDeleteIcon type="Trash" />
              </AddedBoardItem>
            );
          })}

          <Micro>
            Giving the user information something like Make sure groups are
            set-up in Azure AD, see our{' '}
            <A href="#" isExternal>
              documentation
            </A>
          </Micro>
        </BoardsContainer>
      </Flex>
      <SpaceBetween>
        <Button variant="ghost">Cancel</Button>
        <Button type="primary" onClick={handleSubmit}>
          {buttonNames[mode].save}
        </Button>
      </SpaceBetween>
    </>
  );
};
