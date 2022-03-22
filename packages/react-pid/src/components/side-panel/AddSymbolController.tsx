import * as React from 'react';
import { Button, Select, OptionType } from '@cognite/cogs.js';
import {
  SymbolType,
  DocumentType,
  bothSymbolTypes,
  pidSymbolTypes,
  isoSymbolTypes,
  AddSymbolData,
  directedDirections,
  unidirectedDirections,
} from '@cognite/pid-tools';
import styled from 'styled-components';
import { useCallback } from 'react';

import { StyledInput } from './elements';

const SelectionWrapper = styled.div`
  padding: 1em 0;
`;

const directedOptions: OptionType<number>[] = directedDirections.map(
  (direction) => ({
    label: direction[1],
    value: direction[0],
  })
);

const unidirectedOptions: OptionType<number>[] = unidirectedDirections.map(
  (direction) => ({
    label: direction[1],
    value: direction[0],
  })
);

const directionSymbolType = (symbolType: SymbolType | undefined) =>
  symbolType === 'File connection' ||
  symbolType === 'Arrow' ||
  symbolType === 'Reducer' ||
  symbolType === 'Bypass connection';

interface AddSymbolControllerProps {
  symbolSelection: string[];
  addSymbolFromSymbolSelection: (options: AddSymbolData) => void;
  hideSelection: boolean;
  toggleHideSelection: () => void;
  clearSymbolSelection: () => void;
  documentType: DocumentType;
}

export const AddSymbolController: React.FC<AddSymbolControllerProps> = ({
  symbolSelection,
  addSymbolFromSymbolSelection,
  hideSelection,
  toggleHideSelection,
  clearSymbolSelection,
  documentType,
}) => {
  let symbolTypeOptions: OptionType<SymbolType>[];

  if (documentType === DocumentType.pid) {
    symbolTypeOptions = [...bothSymbolTypes, ...pidSymbolTypes]
      .sort()
      .map((symbolType) => ({
        label: symbolType,
        value: symbolType,
      }));
  } else if (documentType === DocumentType.isometric) {
    symbolTypeOptions = [...bothSymbolTypes, ...isoSymbolTypes]
      .sort()
      .map((symbolType) => ({
        label: symbolType,
        value: symbolType,
      }));
  } else {
    symbolTypeOptions = [...bothSymbolTypes].sort().map((symbolType) => ({
      label: symbolType,
      value: symbolType,
    }));
  }

  const [description, setDescription] = React.useState<string>('');

  const [selectedSymbolTypeOption, setSelectedSymbolTypeOption] =
    React.useState<OptionType<SymbolType>>(symbolTypeOptions[0]);

  let directionOptions = directedOptions;

  const [direction, setDirection] = React.useState<OptionType<number>>(
    directionOptions[0]
  );

  const DirectionSelector = useCallback(() => {
    if (selectedSymbolTypeOption.value === 'Bypass connection') {
      directionOptions = unidirectedOptions;
    } else {
      directionOptions = directedOptions;
    }

    const selectValue =
      directionOptions.find((dir) => dir.value === direction.value) ??
      directedOptions[0];

    return (
      <Select
        title="Direction"
        value={selectValue}
        onChange={setDirection}
        options={directionOptions}
        closeMenuOnSelect
        menuPlacement="top"
        maxMenuHeight={500}
      />
    );
  }, [selectedSymbolTypeOption, direction]);

  const addSymbolFromSymbolSelectionWrapper = () => {
    setDescription('');
    addSymbolFromSymbolSelection({
      symbolType: selectedSymbolTypeOption.value!,
      description,
      direction: directionSymbolType(selectedSymbolTypeOption.value)
        ? direction.value
        : undefined,
    });
    setDirection(directedOptions[0]);
  };

  const isDisabled = () => {
    return symbolSelection.length === 0;
  };

  return (
    <>
      <SelectionWrapper>
        <span>{`${symbolSelection.length} selected`}</span>
        <div>
          <Button
            type={hideSelection ? 'danger' : 'secondary'}
            onClick={toggleHideSelection}
          >
            {hideSelection ? 'Show Selection' : 'Hide Selection'}
          </Button>
          <Button
            disabled={symbolSelection.length === 0}
            onClick={clearSymbolSelection}
          >
            Clear Selection
          </Button>
        </div>
      </SelectionWrapper>

      <Select
        closeMenuOnSelect
        title="Symbol type"
        value={selectedSymbolTypeOption}
        onChange={setSelectedSymbolTypeOption}
        options={symbolTypeOptions}
        menuPlacement="top"
        maxMenuHeight={500}
      />
      {directionSymbolType(selectedSymbolTypeOption.value) &&
        DirectionSelector()}
      <div>
        <StyledInput
          width={100}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (isDisabled()) {
                return true;
              }
              addSymbolFromSymbolSelectionWrapper();
              event.preventDefault();
              return false;
            }
            return true;
          }}
          postfix={
            <Button
              type="primary"
              onClick={addSymbolFromSymbolSelectionWrapper}
              disabled={isDisabled()}
            >
              Add
            </Button>
          }
        />
      </div>
    </>
  );
};
