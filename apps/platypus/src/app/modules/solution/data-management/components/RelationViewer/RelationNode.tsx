import uniqolor from 'uniqolor';

import { Body, Flex } from '@cognite/cogs.js';

import { NodeChip, NodeVisibleIcon, NodeWrapper } from './common';
import { FileNode } from './FileNode';
import { TimeSeriesNode } from './TimeSeriesNode';

const getColor = (key: string) => uniqolor(key);

export const RelationNode = <T extends { externalId: string; id: string }>({
  node,
  onClick,
  isSelected,
}: {
  node: T & { __typename: string; dataPoints?: any[] };
  onClick: (node: T) => void;
  isSelected?: boolean;
}) => {
  return (
    <NodeWrapper
      key={node.id}
      __typename={node.__typename}
      onClick={() => {
        if (
          node.__typename !== 'TimeSeries' &&
          node.__typename !== 'File' &&
          node.__typename !== 'Sequence'
        ) {
          onClick(node);
        }
      }}
    >
      <NodeChip
        hideTooltip
        size="small"
        __typename={node.__typename}
        label={node.__typename}
        prominence={getColor(node.__typename).isLight ? 'muted' : 'strong'}
      />
      <Flex gap={2} alignItems="center">
        <Body level={3} id="title">
          {node.externalId}
        </Body>
        {isSelected && NodeVisibleIcon}
      </Flex>
      {node.__typename === 'TimeSeries' && (
        <TimeSeriesNode
          key={node.externalId}
          externalId={node.externalId}
          dataPoints={node.dataPoints}
        />
      )}
      {node.__typename === 'File' && (
        <FileNode key={node.id} externalId={node.externalId} />
      )}
    </NodeWrapper>
  );
};
