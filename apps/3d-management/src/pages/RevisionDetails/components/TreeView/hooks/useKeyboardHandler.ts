import React, { useEffect } from 'react';
import {
  getAncestors,
  getNodeByTreeIndex,
  traverseTree,
} from 'pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import {
  calcRangeKeys,
  convertKeysToSelectedNodes,
} from 'pages/RevisionDetails/components/TreeView/utils/treeViewMultiselectionUtils';
import { TreeDataNode } from 'pages/RevisionDetails/components/TreeView/types';
import { treeDataNodeToSelectedNode } from 'pages/RevisionDetails/components/TreeView/utils/converters';
import {
  NodesTreeViewProps,
  NodesTreeViewRefType,
} from 'pages/RevisionDetails/components/TreeView/NodesTreeView';
import { TreeIndex } from 'store/modules/TreeView';
import { treeViewFocusContainerId } from 'pages/RevisionDetails/components/ToolbarTreeView/treeViewFocusContainerId';

export enum TrackedKeys {
  ' ' = ' ',
  ArrowDown = 'ArrowDown',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  ArrowUp = 'ArrowUp',
  Enter = 'Enter',
  Escape = 'Escape',
}

type Props = Pick<
  NodesTreeViewProps,
  | 'checkedKeys'
  | 'expandedKeys'
  | 'loadChildren'
  | 'onCheck'
  | 'onExpand'
  | 'onSelect'
  | 'selectedNodes'
  | 'treeData'
> & {
  treeRef: React.MutableRefObject<NodesTreeViewRefType> | null;
};

export function useKeyboardHandler(props: Props) {
  // used to mark a node as starting node for shift+click selection
  const lastSelectedKeyRef = React.useRef<TreeIndex>();

  // used to correctly append/remove selection with a shift key to already selected keys
  const cachedSelectedKeysRef = React.useRef<Array<TreeIndex>>();

  // used to correctly shrink/expand current range that created with shift key
  const lastSelectedRangeTailRef = React.useRef<TreeIndex>();

  const { selectedNodes, checkedKeys, treeData, expandedKeys, treeRef } = props;
  const selectedKeys = selectedNodes.map(({ treeIndex }) => treeIndex);

  const toggleCheckedStateOfSelectedNodes = () => {
    let newCheckedNodes: Array<number>;

    if (checkedKeys.includes(selectedKeys[0])) {
      // uncheck selected nodes, all their children and their parents

      const childrenToUncheck = new Set<number>();

      const allParentsToUncheck = new Set<number | string>();

      // every child of every selectedKey must be unchecked,
      selectedKeys.forEach((key) => {
        if (!allParentsToUncheck.has(key)) {
          getAncestors(treeData, key)!.forEach((parentKey) =>
            allParentsToUncheck.add(parentKey)
          );
        }

        traverseTree([getNodeByTreeIndex(treeData, key)!], (currentKey) => {
          if (
            typeof currentKey !== 'number' ||
            childrenToUncheck.has(currentKey)
          ) {
            return false;
          }
          childrenToUncheck.add(currentKey);
          return true;
        });
      });

      newCheckedNodes = checkedKeys.filter(
        (key) => !childrenToUncheck.has(key) && !allParentsToUncheck.has(key)
      );
    } else {
      // check all selected + their children + their parents if possible
      const setOfNewCheckedNodes = new Set(checkedKeys);

      selectedKeys.forEach((selectedNodeKey) => {
        traverseTree(
          [getNodeByTreeIndex(treeData, selectedNodeKey)!],
          (childKey) => {
            if (
              typeof childKey !== 'number' ||
              setOfNewCheckedNodes.has(childKey)
            ) {
              return false;
            }
            setOfNewCheckedNodes.add(childKey);
            return true;
          }
        );
        setOfNewCheckedNodes.add(selectedNodeKey);
      });

      // every parent of checked node must be verified for its .every child is checked -> in that case check parent too
      const parents: Record<TreeIndex, TreeDataNode> = {};
      selectedKeys.forEach((key) => {
        const ancestors = getAncestors(treeData, key)!
          .slice(0, -1) // drop node itself
          .reverse(); // root must be the last to check

        ancestors.forEach((parentKey) => {
          if (setOfNewCheckedNodes.has(parentKey)) {
            return;
          }
          let parentNode: TreeDataNode = parents[parentKey];
          if (!parentNode) {
            parentNode = getNodeByTreeIndex(treeData, parentKey)!;
            parents[parentKey] = parentNode!;
          }

          if (
            parentNode.children!.every(
              (ch) =>
                typeof ch.key !== 'number' || setOfNewCheckedNodes.has(ch.key)
            )
          ) {
            setOfNewCheckedNodes.add(parentKey);
          }
        });
      });

      newCheckedNodes = Array.from(setOfNewCheckedNodes);
    }

    props.onCheck(newCheckedNodes);
  };

  // firstChildIfExpanded -> nextSibling -> ancestorNextChild
  const getNextNode = (treeIndex: number): TreeDataNode | undefined => {
    const node = getNodeByTreeIndex(treeData, treeIndex)!;

    // if expanded -> get children -> select first child
    if (expandedKeys.includes(treeIndex) && node.children?.length) {
      return node.children[0] as TreeDataNode;
    }
    const ancestors = getAncestors(treeData, treeIndex)!.slice(0, -1).reverse();

    for (let i = 0, currentBaseNodeKey = treeIndex; i < ancestors.length; i++) {
      const parent = getNodeByTreeIndex(treeData, ancestors[i])!;
      const currentNodeIndex = parent.children!.findIndex(
        (el) => el.key === currentBaseNodeKey
      );
      const nextSibling = parent.children![currentNodeIndex + 1];
      if (nextSibling && !('cursor' in nextSibling)) {
        return nextSibling as TreeDataNode;
      }
      currentBaseNodeKey = parent.key;
    }

    // case when there is no ancestors is ignored since we always have single root node
    return undefined;
  };

  // sibling -> lastExpandedChildOfParent -> parent
  const getPrevNode = (treeIndex: number): TreeDataNode | undefined => {
    const ancestors = getAncestors(treeData, treeIndex)!.slice(0, -1).reverse();

    const parent = getNodeByTreeIndex(treeData, ancestors[0]);
    if (!parent) {
      return undefined;
    }
    const currentNodeIndex = parent.children!.findIndex(
      (el) => el.key === treeIndex
    );

    const prevSibling = parent.children![currentNodeIndex - 1];
    if (!prevSibling) {
      return parent;
    }
    // get prev sibling
    // if its expanded -> get its last children
    // repeat until !children or not expanded
    let prevNode = prevSibling as TreeDataNode; // cursor is the last one always so it can't be it
    while (expandedKeys.includes(prevNode.key) && prevNode.children) {
      const { children } = prevNode;
      const lastChild = children[children.length - 1];
      if ('cursor' in lastChild) {
        prevNode = children[children.length - 2] as TreeDataNode;
      } else {
        prevNode = lastChild as TreeDataNode;
      }
    }

    return prevNode;
  };

  // fixme: there is code duplicated between ⬇️ and ⬆️ keys, write tests and do refactor
  const arrowDownPressed = (event: KeyboardEvent) => {
    if (lastSelectedKeyRef.current === undefined) {
      lastSelectedKeyRef.current = treeData[0].key;
      cachedSelectedKeysRef.current = [treeData[0].key];
      props.onSelect([treeDataNodeToSelectedNode(treeData[0])]);
      treeRef?.current.scrollTo({ key: treeData[0].key });
      return;
    }

    if (event.shiftKey) {
      if (lastSelectedRangeTailRef.current === undefined) {
        const nextNode = getNextNode(lastSelectedKeyRef.current);
        // single extend from single selected node
        if (nextNode) {
          lastSelectedRangeTailRef.current = nextNode.key;
          props.onSelect(
            convertKeysToSelectedNodes(
              treeData,
              Array.from(
                new Set([
                  ...(cachedSelectedKeysRef.current || []),
                  ...calcRangeKeys({
                    treeData,
                    expandedKeys,
                    startKey: lastSelectedRangeTailRef.current,
                    endKey: lastSelectedKeyRef.current,
                  }),
                ])
              )
            )
          );
          treeRef?.current.scrollTo({ key: lastSelectedRangeTailRef.current });
        }
      } else {
        const nextNode = getNextNode(lastSelectedRangeTailRef.current);
        if (!nextNode) {
          return;
        }
        // shrink or expand selection
        lastSelectedRangeTailRef.current = nextNode.key;
        props.onSelect(
          convertKeysToSelectedNodes(
            treeData,
            Array.from(
              new Set([
                ...(cachedSelectedKeysRef.current || []),
                ...calcRangeKeys({
                  treeData,
                  expandedKeys,
                  startKey: lastSelectedKeyRef.current,
                  endKey: nextNode.key,
                }),
              ])
            )
          )
        );
        treeRef?.current.scrollTo({ key: nextNode.key });
      }
    } else {
      const nextNode = getNextNode(
        lastSelectedRangeTailRef.current ?? lastSelectedKeyRef.current
      );
      if (!nextNode) {
        return;
      }
      lastSelectedKeyRef.current = nextNode.key;
      cachedSelectedKeysRef.current = [nextNode.key];
      lastSelectedRangeTailRef.current = undefined;

      const newSelectedNodes = [treeDataNodeToSelectedNode(nextNode)];
      props.onSelect(newSelectedNodes);
      treeRef?.current.scrollTo({ key: nextNode.key });
    }
  };

  const arrowUpPressed = (event: KeyboardEvent) => {
    if (lastSelectedKeyRef.current === undefined) {
      lastSelectedKeyRef.current = treeData[0].key;
      cachedSelectedKeysRef.current = [treeData[0].key];
      props.onSelect([treeDataNodeToSelectedNode(treeData[0])]);
      treeRef?.current.scrollTo({ key: treeData[0].key });
      return;
    }

    if (event.shiftKey) {
      if (lastSelectedRangeTailRef.current === undefined) {
        const prevNode = getPrevNode(lastSelectedKeyRef.current);
        // single extend from single selected node
        if (prevNode) {
          lastSelectedRangeTailRef.current = prevNode.key;
          props.onSelect(
            convertKeysToSelectedNodes(
              treeData,
              Array.from(
                new Set([
                  ...(cachedSelectedKeysRef.current || []),
                  ...calcRangeKeys({
                    treeData,
                    expandedKeys,
                    startKey: lastSelectedRangeTailRef.current,
                    endKey: lastSelectedKeyRef.current,
                  }),
                ])
              )
            )
          );
          treeRef?.current.scrollTo({ key: lastSelectedRangeTailRef.current });
        }
      } else {
        const prevNode = getPrevNode(lastSelectedRangeTailRef.current);
        if (!prevNode) {
          return;
        }
        // shrink or expand selection
        lastSelectedRangeTailRef.current = prevNode.key;
        props.onSelect(
          convertKeysToSelectedNodes(
            treeData,
            Array.from(
              new Set([
                ...(cachedSelectedKeysRef.current || []),
                ...calcRangeKeys({
                  treeData,
                  expandedKeys,
                  startKey: lastSelectedKeyRef.current,
                  endKey: prevNode.key,
                }),
              ])
            )
          )
        );
        treeRef?.current.scrollTo({ key: prevNode.key });
      }
    } else {
      const prevNode = getPrevNode(
        lastSelectedRangeTailRef.current ?? lastSelectedKeyRef.current
      );
      if (!prevNode) {
        return;
      }
      lastSelectedKeyRef.current = prevNode.key;
      cachedSelectedKeysRef.current = [prevNode.key];
      lastSelectedRangeTailRef.current = undefined;

      const newSelectedNodes = [treeDataNodeToSelectedNode(prevNode)];
      props.onSelect(newSelectedNodes);
      treeRef?.current.scrollTo({ key: prevNode.key });
    }
  };

  const clearSelection = () => {
    if (selectedKeys.length) {
      props.onSelect([]);
    }
  };

  const collapseSelected = () => {
    props.onExpand(expandedKeys.filter((key) => !selectedKeys.includes(key)));
  };

  const expandSelected = async () => {
    // for some reason common expand doesn't work when a single node is not fetched
    // and is expanded with keyboard
    // but expand -> collapse -> expand works fine 🤷
    // and for multiple keys it works. perhaps some tree render bug.
    // looks like tree just wants for some additional rerender to show things
    // below is a workaround for that (mark as expanded, wait for children, then expand it again)
    if (selectedKeys.length === 1) {
      const node = getNodeByTreeIndex(treeData, selectedKeys[0])!;
      props.onExpand(Array.from(new Set(expandedKeys.concat(selectedKeys))));
      await props.loadChildren(node);
    }

    props.onExpand(Array.from(new Set(expandedKeys.concat(selectedKeys))));
  };

  useEffect(() => {
    const container =
      document.getElementById(treeViewFocusContainerId) || treeRef?.current;
    const keyPressed = (event: KeyboardEvent) => {
      // fixme: normally there should be tree ref, or at least its wrapper ref,
      //      but at the moment it's magic selector
      //      it also requires tabindex=-1 to be set on the element that has that id to work 💩
      if (
        !(event.key in TrackedKeys) ||
        !treeData.length ||
        document.activeElement !== container
      ) {
        return;
      }

      event.preventDefault();

      const keyHandlers: Record<keyof typeof TrackedKeys, Function> = {
        ' ': toggleCheckedStateOfSelectedNodes,
        Enter: toggleCheckedStateOfSelectedNodes,
        Escape: clearSelection,
        ArrowLeft: collapseSelected,
        ArrowRight: expandSelected,
        ArrowDown: arrowDownPressed,
        ArrowUp: arrowUpPressed,
      };

      keyHandlers[event.key](event);
    };

    document.addEventListener('keydown', keyPressed);

    return () => document.removeEventListener('keydown', keyPressed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props]);

  return {
    lastSelectedKeyRef,
    cachedSelectedKeysRef,
    lastSelectedRangeTailRef,
  };
}
