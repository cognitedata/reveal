import React, { useState } from 'react';

import { compareVersions } from 'compare-versions';
import styled from 'styled-components/macro';

import { Operation } from '@cognite/calculation-backend';
import { Button, Input, Modal, Menu } from '@cognite/cogs.js';

import Layers from '../../utils/z-index';
import Markdown from '../Markdown/Markdown';
import { useCanvasSize } from '../NodeEditor/V2/CanvasContext';

import CategoryMenu from './CategoryMenu';
import SearchResultMenu from './SearchResultMenu';

export const ToolboxFunctionSubmenu = ({
  categories,
  initialFunction,
  onFunctionSelected,
  children,
}: {
  categories: {
    [key: string]: Operation[];
  };
  initialFunction?: Operation;
  onFunctionSelected: (func: Operation, event: React.MouseEvent) => void;
  children?: React.ReactElement;
}) => {
  const [phrase, setPhrase] = useState<string>('');
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedOperation, setSelectedFunction] = useState<Operation>();

  const latestVersionOfSelectedOperation = (selectedOperation?.versions || [])
    .slice()
    .sort((a, b) => compareVersions(b.version, a.version))[0]!;

  const latestVersionOfInitialOperation = (initialFunction?.versions || [])
    .slice()
    .sort((a, b) => compareVersions(b.version, a.version))[0]!;

  const handleFunctionClick = (event: React.MouseEvent, func: Operation) => {
    setIsDropdownVisible(false);
    onFunctionSelected(func, event);
  };

  const handleInfoButtonClick = (func: Operation) => {
    setSelectedFunction(func);
    setIsModalVisible(true);
  };

  const canvasSize = useCanvasSize();
  const maxHeight =
    typeof canvasSize.height === 'number' ? canvasSize.height - 5 : undefined;

  return (
    <>
      <FunctionsSubmenu
        visible={isDropdownVisible}
        // Prevent dropdown from closing on modal click
        onClickOutside={() => {
          if (!isModalVisible) {
            setIsDropdownVisible(false);
          }
        }}
        zIndex={Layers.DROPDOWN}
        placement="right"
        content={
          <FunctionsSubmenuContent maxHeight={maxHeight}>
            <Input
              id="phrase"
              value={phrase}
              icon="Search"
              onChange={(newValue: React.ChangeEvent<HTMLInputElement>) =>
                setPhrase(newValue.target.value || '')
              }
              placeholder="Search"
              fullWidth
            />
            {phrase ? (
              <SearchResultMenu
                phrase={phrase}
                categories={categories}
                onFunctionClick={handleFunctionClick}
                onInfoButtonClick={handleInfoButtonClick}
              />
            ) : (
              <CategoryMenu
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onFunctionClick={handleFunctionClick}
                onInfoButtonClick={handleInfoButtonClick}
              />
            )}
          </FunctionsSubmenuContent>
        }
      >
        {!children ? (
          <Button
            icon="ChevronDown"
            iconPlacement="right"
            onClick={() => {
              setIsDropdownVisible(!isDropdownVisible);
              setSelectedCategory(undefined);
              setTimeout(() => {
                const phraseEl = document.getElementById('phrase');
                if (phraseEl) {
                  phraseEl.focus();
                }
              }, 300);
            }}
            style={{ width: '100%' }}
          >
            {latestVersionOfSelectedOperation?.name ||
              latestVersionOfInitialOperation?.name ||
              'Select tool function'}
          </Button>
        ) : (
          React.cloneElement(children, {
            onClick: () => {
              setIsDropdownVisible(!isDropdownVisible);
              setSelectedCategory(undefined);
              setTimeout(() => {
                const phraseEl = document.getElementById('phrase');
                if (phraseEl) {
                  phraseEl.focus();
                }
              }, 300);
            },
          })
        )}
      </FunctionsSubmenu>
      <InfoModal
        title={latestVersionOfSelectedOperation?.name}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
        }}
      >
        <Markdown>
          {latestVersionOfSelectedOperation?.description || ''}
        </Markdown>
      </InfoModal>
    </>
  );
};

const FunctionsSubmenu = styled(Menu.Submenu)`
  .cogs-input-container {
    padding: 8px;
    input,
    input:hover,
    input:focus {
      color: var(--cogs-greyscale-grey7);
      background: var(--cogs-greyscale-grey2) !important;
      box-shadow: none;
    }
  }
  &.cogs.cogs-dropdown .tippy-box {
    background-color: white;
  }
`;

const FunctionsSubmenuContent = styled.div<{ maxHeight?: number }>`
  width: 275px;
  max-height: ${(props) =>
    typeof props.maxHeight === 'number' ? props.maxHeight : 400}px;
  overflow-y: auto;
`;

const InfoModal = styled(Modal)`
  .cogs-modal-header {
    border-bottom: none;
    font-size: var(--cogs-t3-font-size);
  }
`;
