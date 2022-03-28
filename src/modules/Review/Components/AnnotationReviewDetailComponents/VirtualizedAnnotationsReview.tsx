import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  FixedSizeTree as Tree,
  TreeWalkerValue,
  TreeWalker,
  FixedSizeNodePublicState,
} from 'react-vtree';
import AutoSizer from 'react-virtualized-auto-sizer';
import { NodeComponentProps } from 'react-vtree/dist/es/Tree';
import {
  NodeMeta,
  TreeData,
  TreeNode,
} from 'src/modules/Review/Components/AnnotationReviewDetailComponents/types';

// This helper function constructs the object that will be sent back at the step
// [2] during the treeWalker function work. Except for the mandatory `data`
// field you can put any additional data here.
const getNodeData = <T,>(
  node: TreeNode<T>,
  nestingLevel: number
): TreeWalkerValue<TreeData<T>, NodeMeta<T>> => ({
  data: {
    id: node.id.toString(), // mandatory
    isLeaf: !node.children || node.children.length === 0,
    isOpenByDefault: node.openByDefault,
    name: node.name,
    nestingLevel,
    node,
  },
  nestingLevel,
  node,
});

/**
 * Generic Tree component for rendering virtualized tree structures
 * @param rootNodeArr
 * @param scrollId
 * @constructor
 */
export const VirtualizedAnnotationsReview = <T,>({
  rootNodeArr,
  scrollId,
}: {
  rootNodeArr: TreeNode<T>[];
  scrollId?: string;
}) => {
  const treeRef = useRef<any>(null);

  useEffect(() => {
    if (scrollId && treeRef.current) {
      treeRef.current.scrollToItem(scrollId, 'start');
    }
  }, [scrollId]);

  const walkerFunction = useCallback(() => {
    // The `treeWalker` function runs only on tree re-build which is performed
    // whenever the `treeWalker` prop is changed.

    function* treeWalker(): ReturnType<TreeWalker<TreeData<T>, NodeMeta<T>>> {
      // Step [1]: Define the root node of our tree. There can be one or
      // multiple nodes.

      for (let i = 0; i < rootNodeArr.length; i++) {
        yield getNodeData(rootNodeArr[i], 0);
      }

      while (true) {
        // Step [2]: Get the parent component back. It will be the object
        // the `getNodeData` function constructed, so you can read any data from it.
        // @ts-ignore
        const parent = yield;

        for (let i = 0; i < parent.node.children.length; i++) {
          // Step [3]: Yielding all the children of the provided component. Then we
          // will return for the step [2] with the first children.
          yield getNodeData(
            parent.node.children[i],
            parent.data.nestingLevel + 1
          );
        }
      }
    }

    return treeWalker();
  }, [rootNodeArr]);

  // Node component receives all the data we created in the `treeWalker` +
  // internal openness state (`isOpen`), function to change internal openness
  // state (`setOpen`) and `style` parameter that should be added to the root div.
  // eslint-disable-next-line react/prop-types
  const Node: React.FC<
    NodeComponentProps<TreeData<T>, FixedSizeNodePublicState<TreeData<T>>>
  > = ({ data: { isLeaf, nestingLevel, node }, isOpen, style, setOpen }) => {
    const { id, name, children, component, additionalData } = node;

    const handleClick = () => {
      setOpen(!isOpen);
    };
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
      <div style={style} onClick={handleClick}>
        {React.createElement(
          component,
          {
            id,
            name,
            isOpen,
            setOpen,
            isLeaf,
            nestingLevel,
            childItems: children,
            additionalData,
          },
          style
        )}
      </div>
    );
  };

  if (rootNodeArr.length) {
    return (
      <AutoSizer disableWidth>
        {({ height }) => (
          <Tree
            ref={treeRef}
            treeWalker={walkerFunction as any}
            itemSize={30}
            height={height}
            width="100%"
          >
            {Node}
          </Tree>
        )}
      </AutoSizer>
    );
  }
  return (
    <EmptyPlaceHolderContainer>
      Annotations not available
    </EmptyPlaceHolderContainer>
  );
};

const EmptyPlaceHolderContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
`;
