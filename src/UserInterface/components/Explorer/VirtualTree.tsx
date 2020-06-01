import React from "react";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import { List as VirtualList } from "react-virtualized/dist/es/List";

import IconElement from "./IconElement";
import { ExpandButton } from "./ExpandButton";
import { TreeCheckBox } from "./TreeCheckbox";
import { TreeNode } from "@/UserInterface/interfaces/explorer";

const DEFAULT_ROW_HEIGHT = 22;

export default function VirtualTree(props: {
  data?: TreeNode[];
  rowHeight?: number;
  expandable?: boolean;
  selectedIds?: string[];
  onToggleNodeSelect: (id: string, state: boolean) => void;
  onToggleNodeExpand: (id: string, state: boolean) => void;
  onToggleNodeCheck: (id: string, state: boolean) => void;
}) {
  const { onToggleNodeSelect, onToggleNodeExpand, onToggleNodeCheck } = props;

  const data = props.data || [];
  const singleRowHeight = props.rowHeight || DEFAULT_ROW_HEIGHT;
  let List: any;
  function setRef(ref: any) {
    List = ref;

    if (List) {
      // todo: remove once events fired by tree control are handled by parent explorer
      List.recomputeRowHeights();
      List.forceUpdate();
    }
  }

  const renderItem = (item: TreeNode, keyPrefix: string) => {
    const onExpand = (event: any) => {
      event.stopPropagation();
      onToggleNodeExpand(item.uniqueId, !item.expanded);
      List.recomputeRowHeights();
      List.forceUpdate();
    };

    const itemProps = { key: keyPrefix };
    let children: any = [];
    const itemText = item.name;

    if (item.children.length) {
      if (item.expanded) {
        children = item.children.map((child: any, index: number) => {
          return renderItem(child, keyPrefix + "-" + index);
        });
      } else {
      }
    } else {
    }

    children.unshift(
      <div className="tree-item center" key="label">
        <div className="tree-item-comp">
          <ExpandButton
            expandable={item.children.length > 0}
            expanded={item.expanded}
            onExpand={onExpand}
            onCollapse={onExpand}
          />
        </div>
        {item.iconVisible && (
          <div className="tree-item-comp">
            <IconElement
              src={item.icon}
              alt={item.iconDescription}
              size="100%"
            />
          </div>
        )}
        <div className="tree-item-comp">
          <TreeCheckBox
            class="tree-checkbox"
            id={keyPrefix}
            filter={item.isFilter}
            checked={item.checked}
            indeterminate={item.indeterminate}
            disabled={item.disabled}
            onToggleCheck={() =>
              onToggleNodeCheck(item.uniqueId, !item.checked)
            }
          />
        </div>
        <div className="tree-item-comp tree-item-lbl-container">
          <span
            className={"tree-item-lbl" + (item.selected ? " selected" : "")}
            onClick={() => onToggleNodeSelect(item.uniqueId, !item.selected)}
          >
            {itemText}
          </span>
        </div>
      </div>
    );
    return (
      <ul key={keyPrefix} className="list">
        <li {...itemProps} children={children} className="list-item" />
      </ul>
    );
  };

  const getExpandedItemCount = (item: TreeNode) => {
    let count = 1;
    if (item.expanded) {
      count += item.children
        .map(getExpandedItemCount)
        .reduce((total: number, num: number) => {
          return total + num;
        }, 0);
    }
    return count;
  };

  const cellRenderer = (params: any) => {
    const renderedCell = renderItem(data[params.index], params.index);
    return (
      <div key={params.key} style={params.style}>
        {renderedCell}
      </div>
    );
  };

  const rowHeight = (params: any) => {
    return getExpandedItemCount(data[params.index]) * singleRowHeight;
  };

  return (
    <div className="virtual-tree-container">
      <AutoSizer
        children={params => {
          return (
            <VirtualList
              height={params.height}
              overscanRowCount={10}
              ref={setRef}
              rowHeight={rowHeight}
              rowRenderer={cellRenderer}
              width={params.width}
              rowCount={data.length}
            />
          );
        }}
      />
    </div>
  );
}
