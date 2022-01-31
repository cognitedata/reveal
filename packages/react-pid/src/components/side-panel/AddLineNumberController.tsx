import React, { useCallback } from 'react';
import { Button, Select, OptionType } from '@cognite/cogs.js';

import { StyledInput } from './elements';

interface AddLineNumberControllerProps {
  lineNumbers: string[];
  setLineNumbers: (args: string[]) => void;
  activeLineNumber: string | null;
  setActiveLineNumber: (arg: string) => void;
}

export const AddLineNumberController: React.FC<AddLineNumberControllerProps> =
  ({ lineNumbers, setLineNumbers, activeLineNumber, setActiveLineNumber }) => {
    const lineNumbersOptions: OptionType<string>[] = lineNumbers.map(
      (lineNumber) => ({
        label: lineNumber,
      })
    );

    const [newLineNumber, setNewLineNumber] = React.useState<string>('');

    const isDisabled = () => {
      return newLineNumber === '' || lineNumbers.includes(newLineNumber);
    };

    const setSelectedLineNumberWrapper = (arg: OptionType<string>) => {
      setActiveLineNumber(arg.label);
    };

    const addLineNumberWrapper = () => {
      setLineNumbers([...lineNumbers, newLineNumber]);
      setActiveLineNumber(newLineNumber);
      setNewLineNumber('');
    };

    const LineNumberSelector = useCallback(() => {
      if (lineNumbersOptions.length) {
        const selectValue =
          (activeLineNumber
            ? lineNumbersOptions.find((lno) => lno.label === activeLineNumber)
            : undefined) || lineNumbersOptions[0];

        return (
          <Select
            title="Active line number"
            value={selectValue}
            onChange={setSelectedLineNumberWrapper}
            options={lineNumbersOptions}
            closeMenuOnSelect
            menuPlacement="top"
            maxMenuHeight={500}
          />
        );
      }
      return <p>No line numbers added</p>;
    }, [lineNumbersOptions, activeLineNumber]);

    return (
      <div>
        {LineNumberSelector()}
        <StyledInput
          value={newLineNumber}
          onChange={(e) => setNewLineNumber(e.target.value)}
          placeholder="New line number"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (isDisabled()) {
                return true;
              }
              addLineNumberWrapper();
              event.preventDefault();
              return false;
            }
            return true;
          }}
          postfix={
            <Button
              type="primary"
              onClick={() => {
                addLineNumberWrapper();
              }}
              disabled={isDisabled()}
            >
              Add
            </Button>
          }
        />
      </div>
    );
  };
