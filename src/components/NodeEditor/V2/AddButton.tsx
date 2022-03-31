import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import ToolboxFunctionDropdown from 'components/ToolboxFunctionDropdown/ToolboxFunctionDropdown';
import { SourceCircle, SourceSquare } from 'pages/ChartView/elements';
import { useState } from 'react';
import styled from 'styled-components/macro';
import Layers from 'utils/z-index';
import { Operation } from '@cognite/calculation-backend';
import { Elements } from 'react-flow-renderer';
import { NodeTypes, SourceOption, NodeDataVariants } from './types';
import { defaultTranslations } from '../translations';
import { getOperationsGroupedByCategory } from '../utils';

interface AddButtonProps {
  elements: Elements<NodeDataVariants>;
  sources: SourceOption[];
  operations: Operation[];
  addSourceNode: (event: React.MouseEvent, source: SourceOption) => void;
  addFunctionNode: (event: React.MouseEvent, func: Operation) => void;
  addConstantNode: (event: React.MouseEvent) => void;
  addOutputNode: (event: React.MouseEvent) => void;
  translations: typeof defaultTranslations;
}

interface AddMenuProps extends AddButtonProps {
  onFunctionSelected?: (func: Operation) => void;
}

const SourceListDropdown = ({
  sources,
  addSourceNode,
  translations: t,
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
      <Menu.Header>{t['Select wanted sources']}</Menu.Header>
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

const AddMenu = ({
  elements,
  sources,
  operations,
  addSourceNode,
  addFunctionNode,
  addConstantNode,
  addOutputNode,
  onFunctionSelected = () => {},
  translations,
}: AddMenuProps) => {
  const hasOutputNode = elements.some((el) => el.type === NodeTypes.OUTPUT);
  const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  return (
    <AddDropdownMenu>
      <MenuItemWrapper
        onClick={() => setIsSourceMenuOpen((isOpen) => !isOpen)}
        onKeyDown={() => setIsSourceMenuOpen((isOpen) => !isOpen)}
        role="button"
      >
        <Menu.Submenu
          visible={isSourceMenuOpen}
          onClickOutside={() => setIsSourceMenuOpen(false)}
          content={
            <SourceListDropdown
              sources={sources}
              addSourceNode={addSourceNode}
              translations={translations}
            />
          }
        >
          <SourceItemTextWrapper>{t.Source}</SourceItemTextWrapper>
        </Menu.Submenu>
      </MenuItemWrapper>
      {!!operations.length && (
        <ToolboxFunctionDropdown
          categories={{
            Recent: [],
            ...getOperationsGroupedByCategory(operations, [
              'Not listed operations',
            ]),
          }}
          onFunctionSelected={(func: Operation, event: React.MouseEvent) => {
            onFunctionSelected(func);
            addFunctionNode(event, func);
          }}
        >
          <Menu.Item appendIcon="ChevronRight">{t.Function}</Menu.Item>
        </ToolboxFunctionDropdown>
      )}
      <Menu.Item onClick={addConstantNode}>{t.Constant}</Menu.Item>
      {!hasOutputNode && (
        <Menu.Item onClick={addOutputNode}>{t.Output}</Menu.Item>
      )}
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
  translations,
}: AddButtonProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const t = {
    ...defaultTranslations,
    ...translations,
  };

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
            translations={translations}
          />
        }
      >
        <Button
          type="primary"
          size="small"
          onClick={() => setIsMenuVisible(!isMenuVisible)}
        >
          {t['Add Node']}
        </Button>
      </Dropdown>
    </AddDropdownContainer>
  );
};

const MenuItemWrapper = styled.div``;

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

export { AddMenu };
export default AddButton;
