import { CogniteExternalId } from '@cognite/sdk';
import isNil from 'lodash/isNil';
import noop from 'lodash/noop';
import React, { useCallback, useMemo } from 'react';
import Tree, { Node } from 'react-virtualized-tree';
import { SuitesByKey } from 'store/suites/types';

import { TREE_UPDATE_TYPE } from './types';
import TreeNodeRenderer from './SuiteTreeNodeRenderer';

type SuitesTreeProps = {
  suitesByKey: SuitesByKey;
  selectedSuiteKey?: CogniteExternalId | null;
  onSelect: (id: CogniteExternalId | null) => void;
  showRoot?: boolean;
  disabledKeys?: string[]; // to disable a suite, e.g. for the current suite
};

const ROOT_ID = '__root';

const mapSuitesToNodes = (
  byKey: SuitesByKey,
  keys?: CogniteExternalId[],
  selectedKey?: string | null,
  disabledKeys?: string[]
): Node[] | undefined =>
  keys?.map((id) => {
    const suite = byKey[id];
    return {
      id: suite.key,
      name: suite.title,
      children: mapSuitesToNodes(
        byKey,
        suite.suites,
        selectedKey,
        disabledKeys
      ),
      state: {
        expanded: true,
        selected: selectedKey === suite.key,
        disabled: Boolean(disabledKeys?.includes(suite.key)),
      },
    };
  }) || [];

const SuitesTree: React.FC<SuitesTreeProps> = ({
  suitesByKey: byKey,
  selectedSuiteKey,
  onSelect,
  showRoot = false,
  disabledKeys,
}) => {
  const nodes = useMemo(() => {
    const rootSuiteIds = Object.values(byKey).reduce<string[]>(
      (ids, suite) => (!suite.parent ? ids.concat([suite.key]) : ids),
      []
    );
    const updatedNodes = mapSuitesToNodes(
      byKey,
      rootSuiteIds,
      selectedSuiteKey,
      disabledKeys
    );
    if (showRoot) {
      // insert [root] as first option
      const rootSuite = {
        id: ROOT_ID,
        name: '[root]',
        state: { selected: isNil(selectedSuiteKey), expanded: true },
        children: updatedNodes,
      };
      return [rootSuite];
    }
    return updatedNodes;
  }, [byKey, mapSuitesToNodes, selectedSuiteKey]);

  const selectHandler = useCallback(
    (nodes: Node[], updatedNode: Node): Node[] => {
      onSelect(updatedNode.id === ROOT_ID ? null : `${updatedNode.id}`);

      return nodes.map((node) => {
        if (node.id === updatedNode.id) {
          return {
            ...updatedNode,
            state: {
              ...updatedNode.state,
              selected: true,
            },
          };
        }
        return {
          ...node,
          state: {
            ...node.state,
            selected: false,
          },
        };
      });
    },
    [onSelect]
  );

  return (
    <Tree
      nodes={nodes || []}
      onChange={noop}
      nodeMarginLeft={12}
      extensions={{
        updateTypeHandlers: {
          [TREE_UPDATE_TYPE.SELECT]: selectHandler,
        },
      }}
    >
      {(props) => (
        <div style={props.style} key={`node-${props.index}`}>
          <TreeNodeRenderer {...props} />
        </div>
      )}
    </Tree>
  );
};

export default React.memo(SuitesTree);
