import * as React from 'react';
import { Input, Button } from '@cognite/cogs.js';

interface AddSymbolControllerProps {
  selection: SVGElement[];
  saveSymbol: (symbolName: string, selection: SVGElement[]) => void;
}

export const AddSymbolController: React.FC<AddSymbolControllerProps> = ({
  selection,
  saveSymbol,
}) => {
  const [symbolText, setSymbolText] = React.useState<string>('');

  return (
    <Input
      value={symbolText}
      onChange={(e) => setSymbolText(e.target.value)}
      placeholder="Symbol name"
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          if (selection.length === 0 || symbolText === '') {
            return true;
          }
          setSymbolText('');
          saveSymbol(symbolText, selection);
          event.preventDefault();
          return false;
        }
        return true;
      }}
      postfix={
        <Button
          type="primary"
          onClick={() => {
            setSymbolText('');
            saveSymbol(symbolText, selection);
          }}
          disabled={selection.length === 0 || symbolText === ''}
        >
          Add
        </Button>
      }
    />
  );
};
