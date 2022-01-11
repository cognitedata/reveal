import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import ToolboxFunctionDropdown from 'components/ToolboxFunctionDropdown/ToolboxFunctionDropdown';
import { SourceCircle, SourceSquare } from 'pages/ChartView/elements';
import { useState } from 'react';
import { getCategoriesFromToolFunctions } from 'components/NodeEditor/V1/Nodes/utils';
import styled from 'styled-components/macro';
import Layers from 'utils/z-index';
import { Operation } from '@cognite/calculation-backend';
import { Elements } from 'react-flow-renderer';
import { NodeTypes, SourceOption, NodeDataVariants } from './types';

interface AddButtonProps {
  elements: Elements<NodeDataVariants>;
  sources: SourceOption[];
  operations: Operation[];
  addSourceNode: (event: React.MouseEvent, source: SourceOption) => void;
  addFunctionNode: (event: React.MouseEvent, func: Operation) => void;
  addConstantNode: (event: React.MouseEvent) => void;
  addOutputNode: (event: React.MouseEvent) => void;
}

interface AddMenuProps extends AddButtonProps {
  onFunctionSelected?: (func: Operation) => void;
}

export const SourceListDropdown = ({
  sources,
  addSourceNode,
}: Omit<
  AddButtonProps,
  | 'elements'
  | 'operations'
  | 'addFunctionNode'
  | 'addConstantNode'
  | 'addOutputNode'
>) => {
  return (
    <SourceDropdownMenu>
      <Menu.Header>Select wanted sources</Menu.Header>
      {sources.map((source) => (
        <SourceMenuItem
          key={source.value}
          onClick={(event) => addSourceNode(event, source)}
        >
          {source.type === 'timeseries' ? (
            <SourceCircle color={source?.color} fade={false} />
          ) : (
            <SourceSquare color={source?.color} fade={false} />
          )}
          {source.label}
        </SourceMenuItem>
      ))}
    </SourceDropdownMenu>
  );
};

export const AddMenu = ({
  elements,
  sources,
  operations,
  addSourceNode,
  addFunctionNode,
  addConstantNode,
  addOutputNode,
  onFunctionSelected = () => {},
}: AddMenuProps) => {
  const hasOutputNode = elements.some((el) => el.type === NodeTypes.OUTPUT);
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);

  return (
    <AddDropdownMenu>
      <Menu.Submenu
        visible={isSourceMenuOpen}
        onClickOutside={() => setIsSourceMenuOpen(false)}
        content={
          <SourceListDropdown sources={sources} addSourceNode={addSourceNode} />
        }
      >
        <SourceItemTextWrapper
          role="button"
          onClick={() => setIsSourceMenuOpen((isOpen) => !isOpen)}
          onKeyDown={() => setIsSourceMenuOpen((isOpen) => !isOpen)}
        >
          Source
        </SourceItemTextWrapper>
      </Menu.Submenu>
      {!!operations.length && (
        <ToolboxFunctionDropdown
          categories={{
            Recent: [],
            ...getCategoriesFromToolFunctions(operations),
          }}
          onFunctionSelected={(func: Operation, event: React.MouseEvent) => {
            onFunctionSelected(func);
            addFunctionNode(event, func);
          }}
        >
          <Menu.Item appendIcon="ChevronRightCompact">Function</Menu.Item>
        </ToolboxFunctionDropdown>
      )}
      <Menu.Item onClick={addConstantNode}>Constant</Menu.Item>
      {!hasOutputNode && <Menu.Item onClick={addOutputNode}>Output</Menu.Item>}
    </AddDropdownMenu>
  );
};

const AddButton = ({
  elements,
  sources,
  operations,
  addSourceNode,
  addFunctionNode,
  addConstantNode,
  addOutputNode,
}: AddButtonProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  return (
    <AddDropdownContainer>
      <Dropdown
        visible={isMenuVisible}
        onClickOutside={() => setIsMenuVisible(false)}
        content={
          <AddMenu
            elements={elements}
            sources={sources}
            operations={operations}
            addSourceNode={addSourceNode}
            addFunctionNode={addFunctionNode}
            addConstantNode={addConstantNode}
            addOutputNode={addOutputNode}
            onFunctionSelected={() => setIsMenuVisible(false)}
          />
        }
      >
        <Button
          type="primary"
          size="small"
          onClick={() => setIsMenuVisible(!isMenuVisible)}
        >
          Add Node
        </Button>
      </Dropdown>
    </AddDropdownContainer>
  );
};

const AddDropdownContainer = styled.div`
  position: absolute;
  min-width: 200px;
  top: 5px;
  left: 5px;
  z-index: ${Layers.MINIMUM};
`;

const SourceItemTextWrapper = styled.div`
  height: 100%;
  width: 100%;
  text-align: left;
`;

const AddDropdownMenu = styled(Menu)`
  width: 180px;
  padding: 5px 0;
`;

const SourceDropdownMenu = styled(Menu)`
  width: 250px;
  padding: 5px 0;
`;

const SourceMenuItem = styled(Menu.Item)`
  height: 40px;
  text-align: left;
  word-break: break-all;
`;

export default AddButton;
