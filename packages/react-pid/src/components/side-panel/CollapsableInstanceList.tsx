import React from 'react';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DiagramEquipmentTagInstance,
  DocumentType,
} from '@cognite/pid-tools';
import styled from 'styled-components';
import { Collapse, Icon } from '@cognite/cogs.js';

import { getInstancesBySymbolId, getInstanceCount } from './utils';
import { CollapsableSymbolHeader } from './CollapsableSymbolHeader';
import { EquipmentTagPanel } from './EquipmentTagPanel';
import { Pre } from './elements';

const ScrollWrapper = styled.div`
  height: 100%;
  overflow-y: scroll;
`;

export const CollapseSeperator = styled.div`
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
  activeTagId: string | null;
  setActiveTagId: (arg: string | null) => void;
  documentType: DocumentType;
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
    activeTagId,
    setActiveTagId,
    documentType,
  }) => {
    const renderSymbolInstances = (
      symbolInstances: DiagramSymbolInstance[],
      symbol: DiagramSymbol
    ) => {
      return (
        <div>
          {getInstancesBySymbolId(symbolInstances, symbol.id).map(
            (instance) => (
              <Pre key={instance.id}>
                {JSON.stringify(instance, undefined, 2)}
              </Pre>
            )
          )}
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
            key={symbol.id}
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
              <Pre key={line.id}>{JSON.stringify(line, null, 2)}</Pre>
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
        {documentType === DocumentType.isometric && (
          <div>
            <CollapseSeperator>Equipment tags</CollapseSeperator>
            <EquipmentTagPanel
              equipmentTags={equipmentTags}
              setEquipmentTags={setEquipmentTags}
              activeTagId={activeTagId}
              setActiveTagId={setActiveTagId}
            />
          </div>
        )}
      </ScrollWrapper>
    );
  };
