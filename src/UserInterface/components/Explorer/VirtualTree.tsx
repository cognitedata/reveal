import React from "react";
import { AutoSizer, List as VirtualList } from "react-virtualized";

import IconElement from "./IconElement";
import { ExpandButton } from "./ExpandButton";
import { TreeCheckBox } from "./TreeCheckbox";
import { TreeNode } from "../../interfaces/explorer";
import Icon from "../Common/Icon";

const DEFAULT_ROW_HEIGHT = 26;

export default function VirtualTree(props: {
  data?: TreeNode[];
  rowHeight?: number;
  expandable?: boolean;
  selectedIds?: string[];
  onToggleNodeSelect: Function,
  onToggleNodeExpand: Function,
  onToggleNodeCheck: Function,
}) {

  const { onToggleNodeSelect, onToggleNodeExpand, onToggleNodeCheck, } = props;

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

  const renderItem = function (item: TreeNode, keyPrefix: string) {

    const onExpand = function (event: any) {
      event.stopPropagation();
      onToggleNodeExpand(item.uniqueId, !item.expanded);
      List.recomputeRowHeights();
      List.forceUpdate();
    };

    const props = { key: keyPrefix };
    let children: any = [];
    let itemText = item.name;

    if (item.children.length) {
      if (item.expanded) {
        children = item.children.map(function (child: any, index: number) {
          return renderItem(child, keyPrefix + "-" + index);
        });
      } else {
      }
    } else {
    }

    children.unshift(
      <div className="tree-item center" key="label">
        <ExpandButton
          expandable={item.children.length > 0}
          expanded={item.expanded}
          onExpand={onExpand}
          onCollapse={onExpand}
        />
        <div className="tree-domain-image">
          <Icon
            name={item.icon.name}
            type={item.icon.type} />
        </div>
        <div className="tree-picked-item">
          <TreeCheckBox
            class="tree-checkbox"
            id={keyPrefix}
            filter={item.isFilter}
            checked={item.checked}
            indeterminate={item.indeterminate}
            disabled={item.disabled}
            onToggleCheck={() => onToggleNodeCheck(item.uniqueId, !item.checked)}
          />
        </div>
        <span
          className={"tree-item-lbl" + (item.selected ? " selected" : "")}
          onClick={() => onToggleNodeSelect(item.uniqueId, !item.selected)}
        >
          {itemText}
        </span>
      </div >
    );
    return (
      <ul key={keyPrefix} className="list">
        <li {...props} children={children} className="list-item"></li>
      </ul>
    );
  };

  const getExpandedItemCount = function (item: TreeNode) {
    var count = 1;
    if (item.expanded) {
      count += item.children
        .map(getExpandedItemCount)
        .reduce(function (total: number, count: number) {
          return total + count;
        }, 0);
    }
    return count;
  };

  const cellRenderer = function cellRenderer(params: any) {
    const renderedCell = renderItem(data[params.index], params.index);
    return (
      <div key={params.key} style={params.style}>
        {renderedCell}
      </div>
    );
  };

  const rowHeight = function rowHeight(params: any) {
    return getExpandedItemCount(data[params.index]) * singleRowHeight;
  };

  return (
    <AutoSizer
      children={function (params) {
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
  );
}
