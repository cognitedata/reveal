import React, { useEffect } from 'react';
import { Modal, Button, Input } from '@cognite/cogs.js';
import styled from 'styled-components';

import { SaveSymbolConflictResolution } from '../../types';

export const ModalFooterWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, max-content);
  justify-content: end;
  gap: 1rem;
`;

interface SaveSymbolModalsProps {
  svgElements?: SVGElement[];
  resolution?: SaveSymbolConflictResolution;
  onResolutionChange: (arg: SaveSymbolConflictResolution) => void;
  symbolName?: string;
  onSymbolNameChange: (arg: string) => void;
  onCancel: () => void;
  saveSymbol: (symbolName: string, selection: SVGElement[]) => void;
}

export const SaveSymbolModals: React.FC<SaveSymbolModalsProps> = ({
  symbolName,
  onSymbolNameChange,
  svgElements,
  resolution,
  onResolutionChange,
  onCancel,
  saveSymbol,
}) => {
  const appElement = document.querySelector('#root') || undefined;

  useEffect(() => {
    if (resolution === 'add' && symbolName && svgElements) {
      saveSymbol(symbolName, svgElements);
    }
  }, [resolution]);

  if (resolution === undefined) {
    return (
      <Modal
        title="Symbol name exists"
        visible
        footer={
          <ModalFooterWrapper>
            <Button
              type="primary"
              icon="Edit"
              onClick={() => onResolutionChange('rename')}
            >
              Rename
            </Button>
            <Button
              type="primary"
              icon="AddToList"
              onClick={() => onResolutionChange('add')}
            >
              Add to {symbolName}
            </Button>
          </ModalFooterWrapper>
        }
        onCancel={onCancel}
        appElement={appElement}
      >
        <p>
          Do you want to rename or add this symbol as an instance to{' '}
          {symbolName}
        </p>
      </Modal>
    );
  }
  if (resolution === 'rename') {
    return (
      <Modal
        title="Provide a new name"
        visible
        okDisabled={symbolName === ''}
        onCancel={() => onCancel}
        onOk={() => {
          saveSymbol(symbolName || '', svgElements || []);
        }}
        appElement={appElement}
      >
        <Input
          title="Symbol name"
          onChange={(event) => onSymbolNameChange(event.target.value)}
          value={symbolName}
          fullWidth
        />
      </Modal>
    );
  }

  return <></>;
};
