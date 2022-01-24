import React from 'react';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramEquipmentTagInstance,
} from '@cognite/pid-tools';
import styled from 'styled-components';
import { Collapse, Icon } from '@cognite/cogs.js';

import { getInstancesBySymbol, getInstanceCount } from './utils';
import { CollapsableSymbolHeader } from './CollapsableSymbolHeader';
import { EquipmentTagPanel } from './EquipmentTagPanel';

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

const ConnectionItem = styled.div`
  display: grid;
  grid-template-columns: auto max-content;
`;

interface CollapsableInstanceListProps {
  symbols: DiagramSymbol[];
  symbolInstances: DiagramSymbolInstance[];
  lineInstances: DiagramLineInstance[];
  connections: DiagramConnection[];
  deleteSymbol: (symbol: DiagramSymbol) => void;
  deleteConnection: (connection: DiagramConnection) => void;
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
  activeTagName: string | undefined;
  setActiveTagName: (arg: string | undefined) => void;
}

export const CollapsableInstanceList: React.FC<CollapsableInstanceListProps> =
  ({
    symbols,
    symbolInstances,
    lineInstances,
    connections,
    deleteSymbol,
    deleteConnection,
    equipmentTags,
    setEquipmentTags,
    activeTagName,
    setActiveTagName,
  }) => {
    const renderSymbolInstances = (
      symbolInstances: DiagramSymbolInstance[],
      symbol: DiagramSymbol
    ) => {
      return (
        <div>
          {getInstancesBySymbol(symbolInstances, symbol).map((instance) => (
            <p key={instance.pathIds.join('')}>
              {`{scale: ${
                instance.scale === undefined
                  ? undefined
                  : instance.scale.toFixed(3)
              },
pathIds: [${instance.pathIds.join(', ')}]}`}
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
              symbolInstanceCount: getInstanceCount(symbolInstances, symbol),
              deleteSymbol,
            })}
            key={symbol.svgRepresentations[0].svgPaths
              .map((svgPath) => svgPath.svgCommands)
              .join()}
          >
            {renderSymbolInstances(symbolInstances, symbol)}
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
                {`{pathIds: [${line.pathIds.join(', ')}]}`}
              </p>
            ))}
          </Collapse.Panel>
        </Collapse>

        <CollapseSeperator>Symbols</CollapseSeperator>
        <Collapse accordion ghost>
          {renderSymbolPanels(symbols, symbolInstances)}
        </Collapse>

        <CollapseSeperator>Connections</CollapseSeperator>
        <Collapse accordion ghost>
          <Collapse.Panel header={`Connections (${connections?.length || 0})`}>
            {connections?.map((connection) => (
              <ConnectionItem key={`${connection.start}.${connection.end}`}>
                <p>
                  {`${connection.start} ${
                    connection.direction === 'unknown' ? '--' : '->'
                  } ${connection.end}`}
                </p>
                <Icon
                  onClick={() => deleteConnection(connection)}
                  type="Close"
                  size={12}
                />
              </ConnectionItem>
            ))}
          </Collapse.Panel>
        </Collapse>

        <CollapseSeperator>Equipment tags</CollapseSeperator>
        <EquipmentTagPanel
          equipmentTags={equipmentTags}
          setEquipmentTags={setEquipmentTags}
          activeTagName={activeTagName}
          setActiveTagName={setActiveTagName}
        />
      </ScrollWrapper>
    );
  };
