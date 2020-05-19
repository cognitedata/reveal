import React, { useState, ReactText } from "react";
import { AutoSizer, List as VirtualList } from "react-virtualized";
import IconElement from "./IconElement";
import { ExpandButton } from "./ExpandButton";
import { TreeCheckBox } from "./TreeCheckbox";
import { TreeDataItem } from "../../../interfaces/explorer";

const DEFAULT_ROW_HEIGHT = 26;

export default function VirtualTree(props: {
  data?: TreeDataItem[];
  rowHeight?: number;
  expandable?: boolean;
  selectedIds?: ReactText[];
}) {
  const [selectedItem, SetSelectedItem] = useState<TreeDataItem>();
  const [checkedItemIdList, SetCheckedItemIdList] = useState<ReactText[]>(
    props.selectedIds || []
  );
  const data = props.data || [];
  const singleRowHeight = props.rowHeight || DEFAULT_ROW_HEIGHT;
  let List: any;
  function setRef(ref: any) {
    List = ref;

    if (List) {
      List.recomputeRowHeights();
      List.forceUpdate();
    }
  }

  const renderItem = function(item: TreeDataItem, keyPrefix: string) {
    const onExpand = function(event: any) {
      event.stopPropagation();
      item.expanded = !item.expanded;
      List.recomputeRowHeights();
      List.forceUpdate();
    };

    const onSelect = function(event: any) {
      event.stopPropagation();
      item.selected = !item.selected;
      if (selectedItem && selectedItem.id !== item.id) {
        selectedItem.selected = false;
      }
      if (item.selected) {
        SetSelectedItem(item);
      } else {
        SetSelectedItem(undefined);
      }
    };

    const onCheckChange = function(event: any, status: boolean) {
      item.checked = status;
      if (status) {
        SetCheckedItemIdList([...checkedItemIdList, item.id]);
      } else {
        SetCheckedItemIdList(
          checkedItemIdList.filter((elm) => elm !== item.id)
        );
      }
    };

    const props = { key: keyPrefix };
    let children: any = [];
    let itemText = item.name;

    if (item.children.length) {
      if (item.expanded) {
        children = item.children.map(function(child: any, index: number) {
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
          <IconElement src={item.icon} alt={item.iconDescription} size="24px" />
        </div>
        <div className="tree-picked-item">
          <TreeCheckBox
            class="tree-checkbox"
            id={keyPrefix}
            filter={item.isFilter}
            checked={item.checked}
            indeterminate={item.indeterminate}
            disabled={item.disabled}
            onToggleCheck={onCheckChange}
          />
        </div>
        <span
          className={"tree-item-lbl" + (item.selected ? " selected" : "")}
          onClick={onSelect}
        >
          {itemText}
        </span>
      </div>
    );
    return (
      <ul key={keyPrefix} className="list">
        <li {...props} children={children} className="list-item"></li>
      </ul>
    );
  };

  const getExpandedItemCount = function(item: TreeDataItem) {
    var count = 1;

    if (item.expanded) {
      count += item.children
        .map(getExpandedItemCount)
        .reduce(function(total: number, count: number) {
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
      children={function(params) {
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
