import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import cursorSelectedIcon from '../icons/cursor-selected.svg';
import cursorIcon from '../icons/cursor.svg';
import pointerSelectedIcon from '../icons/pointer-selected.svg';
import pointerIcon from '../icons/pointer.svg';

import { CursorModeSelectorWrapper } from './elements';

interface Props {
  cursorMode: string;
  onChange: (value: string) => void;
}

export const CursorModeSelector: React.FC<Props> = ({
  cursorMode,
  onChange,
}) => {
  return (
    <CursorModeSelectorWrapper>
      <Button
        type="ghost"
        size="small"
        onClick={() => {
          onChange('pan');
        }}
        aria-label="Pan Mode"
      >
        <img
          src={cursorMode === 'pan' ? pointerSelectedIcon : pointerIcon}
          alt="pan"
        />
      </Button>
      <Button
        type="ghost"
        size="small"
        onClick={() => {
          onChange('info');
        }}
        aria-label="Info Mode"
      >
        <img
          src={cursorMode === 'info' ? cursorSelectedIcon : cursorIcon}
          alt="cursor"
        />
      </Button>
    </CursorModeSelectorWrapper>
  );
};
