import React from 'react';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  PathReplacementGroup,
  PathReplacementType,
  DiagramTag,
} from '@cognite/pid-tools';
import styled from 'styled-components';
import { Collapse, Icon } from '@cognite/cogs.js';
import uniqBy from 'lodash/uniqBy';

import usePathReplacementGroupsByType from '../../utils/usePathReplacementsByType';

import { getInstancesBySymbolId } from './utils';
import { CollapsableSymbolHeader } from './CollapsableSymbolHeader';
import { TagPanel } from './TagPanel';
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
  tags: DiagramTag[];
  setTags: (arg: DiagramTag[]) => void;
  activeTagId: string | null;
  setActiveTagId: (arg: string | null) => void;
  pathReplacementGroups: PathReplacementGroup[];
  deletePathReplacementGroups: (
    pathReplacementGroupsIds: string[] | string
  ) => void;
}

export const CollapsableInstanceList: React.FC<
  CollapsableInstanceListProps
> = ({
  symbols,
  symbolInstances,
  lineInstances,
  connections,
  deleteSymbol,
  deleteConnection,
  tags: equipmentTags,
  setTags: setEquipmentTags,
  activeTagId,
  setActiveTagId,
  pathReplacementGroups,
  deletePathReplacementGroups,
}) => {
  const renderSymbolInstances = (
    symbolInstances: DiagramSymbolInstance[],
    symbol: DiagramSymbol
  ) => {
    return (
      <div>
        {getInstancesBySymbolId(symbolInstances, symbol.id).map((instance) => (
          <Pre key={instance.id}>{JSON.stringify(instance, undefined, 2)}</Pre>
        ))}
      </div>
    );
  };

  const renderSymbolPanels = (
    symbols: DiagramSymbol[],
    symbolInstances: DiagramSymbolInstance[]
  ) => {
    return symbols.map((symbol) => {
      const symInstances = getInstancesBySymbolId(symbolInstances, symbol.id);
      return (
        <Collapse.Panel
          header={CollapsableSymbolHeader({
            symbol,
            symbolInstanceCount: symInstances.length,
            foundRotations: uniqBy(symInstances, (si) => si.rotation).length,
            deleteSymbol,
          })}
          key={symbol.id}
        >
          {renderSymbolInstances(symbolInstances, symbol)}
        </Collapse.Panel>
      );
    });
  };

  const { pathReplacementGroupMap, deletePathReplacementByType } =
    usePathReplacementGroupsByType(
      pathReplacementGroups,
      deletePathReplacementGroups
    );

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
        <Collapse.Panel header={`Connections (${connections.length})`}>
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

      <CollapseSeperator>Path Replacements</CollapseSeperator>
      <Collapse accordion ghost>
        {Object.keys(pathReplacementGroupMap).map((key) => (
          <Collapse.Panel
            key={key}
            header={
              <>
                <div>
                  {key} (
                  {pathReplacementGroupMap[key as PathReplacementType].length})
                </div>
                <Icon
                  onClick={() => {
                    deletePathReplacementByType(key as PathReplacementType);
                  }}
                  type="Close"
                  size={12}
                  style={{ marginLeft: 'auto' }}
                />
              </>
            }
          >
            {pathReplacementGroupMap[key as PathReplacementType].map(
              (group) => (
                <ConnectionItem key={group.id}>
                  <Pre key={group.id}>
                    {JSON.stringify(group.replacements, null, 2)}
                  </Pre>
                  <Icon
                    onClick={() => {
                      deletePathReplacementGroups(group.id);
                    }}
                    type="Close"
                    size={12}
                  />
                </ConnectionItem>
              )
            )}
          </Collapse.Panel>
        ))}
      </Collapse>
      <div>
        <CollapseSeperator>Tags</CollapseSeperator>
        <TagPanel
          tags={equipmentTags}
          setTags={setEquipmentTags}
          activeTagId={activeTagId}
          setActiveTagId={setActiveTagId}
        />
      </div>
    </ScrollWrapper>
  );
};
