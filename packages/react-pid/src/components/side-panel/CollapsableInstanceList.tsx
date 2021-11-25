import React from 'react';
import {
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '@cognite/pid-tools';
import styled from 'styled-components';
import { Collapse } from '@cognite/cogs.js';

import { getInstancesByName, getInstanceCount } from './utils';
import { CollapsableSymbolHeader } from './CollapsableSymbolHeader';

const ScrollWrapper = styled.div`
  height: 100%;
  overflow-y: scroll;
`;

const CollapseSeperator = styled.div`
  padding: 0.5rem 1rem;
  text-align: left;
  background: #f7f7f7;
  border-bottom: 1px solid #d9d9d9;
`;

interface CollapsableInstanceListProps {
  symbols: DiagramSymbol[];
  symbolInstances: DiagramSymbolInstance[];
  lineInstances: DiagramLineInstance[];
}

export const CollapsableInstanceList: React.FC<CollapsableInstanceListProps> =
  ({ symbols, symbolInstances, lineInstances }) => {
    const renderSymbolInstances = (
      symbolInstances: DiagramSymbolInstance[],
      symbolName: string
    ) => {
      return (
        <div>
          {getInstancesByName(symbolInstances, symbolName).map((instance) => (
            <p key={instance.pathIds.join('')}>
              {instance.symbolName}&nbsp;-&nbsp;
              {instance.pathIds.join(' ')}
            </p>
          ))}
        </div>
      );
    };

    const renderSymbolPanels = (
      symbols: DiagramSymbol[],
      symbolInstances: DiagramSymbolInstance[]
    ) => {
      return symbols.map((symbol) => {
        return (
          <Collapse.Panel
            header={CollapsableSymbolHeader({
              symbol,
              symbolInstanceCount: getInstanceCount(
                symbolInstances,
                symbol.symbolName
              ),
            })}
            key={symbol.svgRepresentations[0].svgPaths
              .map((svgPath) => svgPath.svgCommands)
              .join()}
          >
            {renderSymbolInstances(symbolInstances, symbol.symbolName)}
          </Collapse.Panel>
        );
      });
    };

    return (
      <ScrollWrapper>
        <CollapseSeperator>Lines</CollapseSeperator>
        <Collapse accordion ghost>
          <Collapse.Panel header={`Flowlines (${lineInstances?.length || 0})`}>
            {lineInstances?.map((line) => (
              <p key={line.pathIds.join('')}>
                {line.symbolName}&nbsp;-&nbsp;
                {line.pathIds.join(' . ')}
              </p>
            ))}
          </Collapse.Panel>
        </Collapse>
        <CollapseSeperator>Symbols</CollapseSeperator>
        <Collapse accordion ghost>
          {renderSymbolPanels(symbols, symbolInstances)}
        </Collapse>
      </ScrollWrapper>
    );
  };
