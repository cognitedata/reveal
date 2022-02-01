import * as React from 'react';
import { Button, Select, OptionType } from '@cognite/cogs.js';
import { symbolTypes, SymbolType } from '@cognite/pid-tools';

import { SaveSymbolData } from '../../ReactPid';

import { StyledInput } from './elements';

const symbolTypeOptions: OptionType<SymbolType>[] = symbolTypes.map(
  (symbolType) => ({
    label: symbolType,
    value: symbolType,
  })
);

interface AddSymbolControllerProps {
  selection: SVGElement[];
  saveSymbol: (options: SaveSymbolData, selection: SVGElement[]) => void;
}

export const AddSymbolController: React.FC<AddSymbolControllerProps> = ({
  selection,
  saveSymbol,
}) => {
  const [description, setDescription] = React.useState<string>('');

  const [selectedSymbolTypeOption, setSelectedSymbolTypeOption] =
    React.useState<OptionType<SymbolType>>(symbolTypeOptions[0]);

  const saveSymbolWrapper = () => {
    setDescription('');
    saveSymbol(
      { symbolType: selectedSymbolTypeOption.value!, description },
      selection
    );
  };

  const isDisabled = () => {
    return selection.length === 0 || description === '';
  };

  return (
    <div>
      <Select
        closeMenuOnSelect
        title="Symbol type"
        value={selectedSymbolTypeOption}
        onChange={setSelectedSymbolTypeOption}
        options={symbolTypeOptions}
        menuPlacement="top"
        maxMenuHeight={500}
      />
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
            saveSymbolWrapper();
            event.preventDefault();
            return false;
          }
          return true;
        }}
        postfix={
          <Button
            type="primary"
            onClick={() => {
              saveSymbolWrapper();
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
