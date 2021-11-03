import * as React from 'react';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import { Input, Button, ToolBar, ToolBarButton } from '@cognite/cogs.js';
import { DiagramSymbol } from '@cognite/pid-tools';

const saveSymbolsAsJson = (symbols: DiagramSymbol[]) => {
  const jsonData = {
    symbols,
  };
  const fileToSave = new Blob([JSON.stringify(jsonData, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'DiagramSymbols.json');
};

const ToolBarWrapper = styled.div`
  padding: 40px;
  .active {
    background-color: var(--cogs-btn-color-primary);
    color: white;
    &:hover {
      background-color: var(--cogs-btn-color-primary);
      color: white;
    }
  }
`;

interface SideViewProps {
  active: string;
  symbols: DiagramSymbol[];
  selection: SVGElement[];
  setActive: (arg0: string) => void;
  loadSymbolsAsJson: (args0: string) => void;
  saveSymbol: (symbolName: string, selection: SVGElement[]) => void;
}

export const SideView = ({
  active,
  symbols,
  selection,
  setActive,
  loadSymbolsAsJson,
  saveSymbol,
}: SideViewProps) => {
  const [symbolText, setSymbolText] = React.useState<string>('');

  const handleSymbolFileChange = ({ target }: any) => {
    if (target && target.files.length > 0) {
      fetch(URL.createObjectURL(target.files[0]))
        .then((response) => {
          return response.json();
        })
        .then((json) => loadSymbolsAsJson(json));
    }
  };

  const ActionWithCustomStyling: ToolBarButton[][] = [
    [
      {
        icon: 'PlusCompact',
        onClick: () =>
          active === 'AddSymbol' ? setActive('') : setActive('AddSymbol'),
        className: `${active === 'AddSymbol' && 'active'}`,
        'aria-label': 'Add symbol',
      },
    ],
  ];

  return (
    <div>
      <input
        type="file"
        accept="application/JSON"
        onChange={handleSymbolFileChange}
      />
      <div>
        {symbols.map((symbol) => {
          return (
            <div
              key={symbol.svgPaths.map((svgPath) => svgPath.svgCommands).join()}
            >
              <p>{`${symbol.symbolName}, #paths: ${symbol.svgPaths.length}`}</p>
            </div>
          );
        })}
      </div>
      {active === 'AddSymbol' && (
        <Input
          value={symbolText}
          onChange={(e) => setSymbolText(e.target.value)}
          title="Symbol name"
          postfix={
            <Button
              type="primary"
              onClick={() => {
                setSymbolText('');
                saveSymbol(symbolText, selection);
              }}
              disabled={selection.length === 0}
            >
              Add
            </Button>
          }
        />
      )}
      <Button
        onClick={() => saveSymbolsAsJson(symbols)}
        disabled={symbols.length === 0}
      >
        Download symbols as JSON
      </Button>

      <ToolBarWrapper>
        <ToolBar buttonGroups={ActionWithCustomStyling} />
      </ToolBarWrapper>
    </div>
  );
};
