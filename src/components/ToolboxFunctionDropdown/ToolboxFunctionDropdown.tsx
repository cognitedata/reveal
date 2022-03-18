import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { Operation } from '@cognite/calculation-backend';
import { Button, Dropdown, Input, Modal } from '@cognite/cogs.js';
import Layers from 'utils/z-index';
import compareVersions from 'compare-versions';
import Markdown from 'components/Markdown/Markdown';
import CategoryMenu from './CategoryMenu';
import SearchResultMenu from './SearchResultMenu';

const ToolboxFunctionDropdown = ({
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

  return (
    <>
      <FunctionsDropdown
        visible={isDropdownVisible}
        // Prevent dropdown from closing on modal click
        onClickOutside={
          !isModalVisible ? () => setIsDropdownVisible(false) : () => {}
        }
        zIndex={Layers.DROPDOWN}
        placement="right"
        content={
          <FunctionsDropdownContent>
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
          </FunctionsDropdownContent>
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
      </FunctionsDropdown>
      <InfoModal
        appElement={document.getElementsByTagName('body')}
        title={latestVersionOfSelectedOperation?.name}
        visible={isModalVisible}
        footer={null}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        width={750}
      >
        <Markdown>
          {latestVersionOfSelectedOperation?.description || ''}
        </Markdown>
      </InfoModal>
    </>
  );
};

const FunctionsDropdown = styled(Dropdown)`
  width: 275px;

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
`;

const FunctionsDropdownContent = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const InfoModal = styled(Modal)`
  .cogs-modal-header {
    border-bottom: none;
    font-size: var(--cogs-t3-font-size);
  }
`;

export default ToolboxFunctionDropdown;
