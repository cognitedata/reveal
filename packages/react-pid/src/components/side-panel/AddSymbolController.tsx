import * as React from 'react';
import { Input, Button, Select, OptionType } from '@cognite/cogs.js';
import { symbolTypes } from '@cognite/pid-tools';

import { SaveSymbolData } from '../../ReactPid';

const symbolTypeOptions: OptionType<string>[] = symbolTypes.map(
  (symbolType) => ({
    label: symbolType,
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
    React.useState<OptionType<string>>(symbolTypeOptions[0]);

  const saveSymbolWrapper = () => {
    setDescription('');
    saveSymbol(
      { symbolType: selectedSymbolTypeOption.label, description },
      selection
    );
  };

  const isDisabled = () => {
    return selection.length === 0 || description === '';
  };

  return (
    <div>
      <Select
        title="Symbol type"
        value={selectedSymbolTypeOption}
        onChange={setSelectedSymbolTypeOption}
        options={symbolTypeOptions}
      />
      <Input
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
