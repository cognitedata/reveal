import * as React from 'react';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import { Input, Button, ToolBar, ToolBarButton } from '@cognite/cogs.js';
import {
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '@cognite/pid-tools';

import { CollapsableInstanceList } from './CollapsableInstanceList';

const saveSymbolsAsJson = (symbols: DiagramSymbol[]) => {
  const jsonData = {
    symbols,
  };
  const fileToSave = new Blob([JSON.stringify(jsonData, undefined, 2)], {
    type: 'application/json',
  });
  saveAs(fileToSave, 'DiagramSymbols.json');
};

const SidePanelWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content auto max-content;
  height: 100%;
`;

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

interface SidePanelProps {
  active: string;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  selection: SVGElement[];
  setActive: (arg0: string) => void;
  loadSymbolsAsJson: (args0: string) => void;
  saveSymbol: (symbolName: string, selection: SVGElement[]) => void;
}

export const SidePanel = ({
  active,
  symbols,
  lines,
  symbolInstances,
  selection,
  setActive,
  loadSymbolsAsJson,
  saveSymbol,
}: SidePanelProps) => {
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
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () =>
          active === 'AddLine' ? setActive('') : setActive('AddLine'),
        className: `${active === 'AddLine' && 'active'}`,
        description: 'Add line',
      },
    ],
  ];

  return (
    <SidePanelWrapper>
      <div>
        <input
          type="file"
          accept="application/JSON"
          onChange={handleSymbolFileChange}
        />
      </div>
      <CollapsableInstanceList
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
      />
      <div>
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
                disabled={selection.length === 0 || symbolText === ''}
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
          <ToolBar
            direction="horizontal"
            buttonGroups={ActionWithCustomStyling}
          />
        </ToolBarWrapper>
      </div>
    </SidePanelWrapper>
  );
};
