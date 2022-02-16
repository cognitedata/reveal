import React, { useCallback } from 'react';
import { Button, Select, OptionType } from '@cognite/cogs.js';

import { StyledInput } from './elements';

interface AddLineNumberControllerProps {
  lineNumbers: number[];
  setLineNumbers: (args: number[]) => void;
  activeLineNumber: number | null;
  setActiveLineNumber: (arg: number | null) => void;
}

export const AddLineNumberController: React.FC<AddLineNumberControllerProps> =
  ({ lineNumbers, setLineNumbers, activeLineNumber, setActiveLineNumber }) => {
    const lineNumbersOptions: OptionType<number>[] = lineNumbers.map(
      (lineNumber) => ({
        label: lineNumber.toString(),
        value: lineNumber,
      })
    );

    const [newLineNumber, setNewLineNumber] = React.useState<number>();

    const isDisabled = () => {
      return newLineNumber === undefined || lineNumbers.includes(newLineNumber);
    };

    const setSelectedLineNumberWrapper = (arg: OptionType<number>) => {
      setActiveLineNumber(arg.value!);
    };

    const addLineNumberWrapper = () => {
      if (newLineNumber) {
        setLineNumbers([...lineNumbers, newLineNumber]);
      } else {
        setActiveLineNumber(null);
      }
      setNewLineNumber(undefined);
    };

    const addNewLineNumber = (inputString: string) => {
      const stringNumbers = inputString.match(/\d+/)?.[0];
      const number = stringNumbers ? parseInt(stringNumbers, 10) : -1;
      setNewLineNumber(number);
    };

    const LineNumberSelector = useCallback(() => {
      if (lineNumbersOptions.length) {
        const selectValue =
          (activeLineNumber
            ? lineNumbersOptions.find((lno) => lno.value === activeLineNumber)
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
          type="number"
          value={newLineNumber}
          onChange={(e) => addNewLineNumber(e.target.value)}
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
