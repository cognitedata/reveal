import * as React from 'react';
import styled from 'styled-components';
import { saveAs } from 'file-saver';
import {
  Input,
  Button,
  ToolBar,
  ToolBarButton,
  Collapse,
} from '@cognite/cogs.js';
import { DiagramSymbol, DiagramSymbolInstance } from '@cognite/pid-tools';

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

const ScrollWrapper = styled.div`
  height: 100%;
  overflow-y: scroll;
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

const CollapseHeader = styled.div`
  display: grid;
  grid-template-columns: auto 3rem;
  align-items: center;
  width: 100%;
`;

interface SideViewProps {
  active: string;
  symbols: DiagramSymbol[];
  symbolInstances: DiagramSymbolInstance[];
  selection: SVGElement[];
  setActive: (arg0: string) => void;
  loadSymbolsAsJson: (args0: string) => void;
  saveSymbol: (symbolName: string, selection: SVGElement[]) => void;
}

export const SideView = ({
  active,
  symbols,
  symbolInstances,
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

  const symbolHeaderRenderer = (symbol: DiagramSymbol) => {
    return (
      <CollapseHeader>
        <span>
          {`${symbol.symbolName} (${
            symbolInstances.filter(
              (instance) => instance.symbolName === symbol.symbolName
            ).length
          })`}
        </span>
        <svg
          viewBox={`${symbol.boundingBox.x - 10} ${symbol.boundingBox.y - 10} ${
            symbol.boundingBox.width + 20
          } ${symbol.boundingBox.height + 20}`}
          style={{ aspectRatio: '1 / 1', height: '2rem' }}
        >
          {symbol.svgPaths.map((path) => {
            return (
              <path
                key={path.svgCommands}
                d={path.svgCommands}
                style={{
                  strokeWidth: '12',
                  stroke: 'black',
                  fill: 'none',
                }}
              />
            );
          })}
        </svg>
      </CollapseHeader>
    );
  };

  const renderSymbolInstances = (symbol: DiagramSymbol) => {
    return (
      <div>
        {symbolInstances
          .filter((instance) => {
            return instance.symbolName === symbol.symbolName;
          })
          .map((instance) => (
            <p key={instance.svgElements.map((path) => path.id).join('')}>
              {instance.symbolName}&nbsp;-&nbsp;
              {instance.svgElements.map((path) => path.id).join(' . ')}
            </p>
          ))}
      </div>
    );
  };

  return (
    <SidePanelWrapper>
      <div>
        <input
          type="file"
          accept="application/JSON"
          onChange={handleSymbolFileChange}
        />
      </div>
      <ScrollWrapper>
        <Collapse accordion ghost>
          {symbols.map((symbol) => {
            return (
              <Collapse.Panel
                header={symbolHeaderRenderer(symbol)}
                key={symbol.svgPaths
                  .map((svgPath) => svgPath.svgCommands)
                  .join()}
              >
                {renderSymbolInstances(symbol)}
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </ScrollWrapper>
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
          <ToolBar buttonGroups={ActionWithCustomStyling} />
        </ToolBarWrapper>
      </div>
    </SidePanelWrapper>
  );
};
