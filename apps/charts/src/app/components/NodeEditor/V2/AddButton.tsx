import { useState } from 'react';
import { Elements } from 'react-flow-renderer';

import ToolboxFunctionDropdown from '@charts-app/components/ToolboxFunctionDropdown/ToolboxFunctionDropdown';
import {
  SourceCircle,
  SourceSquare,
} from '@charts-app/pages/ChartViewPage/elements';
import styled from 'styled-components/macro';

import { Operation } from '@cognite/calculation-backend';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import { defaultTranslations } from '../translations';
import { getOperationsGroupedByCategory } from '../utils';

import { useCanvasSize } from './CanvasContext';
import { NodeTypes, SourceOption, NodeDataVariants } from './types';

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
  const canvasSize = useCanvasSize();
  const maxHeight =
    typeof canvasSize.height === 'number' ? canvasSize.height - 50 : undefined;

  return (
    <SourceDropdownMenu>
      <Menu.Header>{t['Select wanted sources']}</Menu.Header>
      <SourcesContainer maxHeight={maxHeight}>
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
      </SourcesContainer>
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
          <Menu.Item icon="ChevronRight">{t.Function}</Menu.Item>
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
        icon="Add"
      >
        {t['Add Node']}
      </Button>
    </Dropdown>
  );
};

const MenuItemWrapper = styled.div``;

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
  max-width: 275px;
  padding: 5px 5px;
`;

const SourceMenuItem = styled(Menu.Item)`
  height: 40px;
  text-align: left;
  word-break: break-all;
`;

const SourcesContainer = styled.div<{ maxHeight?: number }>`
  max-height: ${(props) =>
    typeof props.maxHeight === 'number' ? props.maxHeight : 390}px;
  overflow-y: auto;
`;

export { AddMenu };
export default AddButton;
