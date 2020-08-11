import "./virtual-tree.scss";
import React, { KeyboardEvent } from "react";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import { List as VirtualList } from "react-virtualized/dist/es/List";
import { readCssVariablePixelNumber } from "@/UserInterface/Foundation/Utils/cssUtils";
import { HTMLUtils } from "@/UserInterface/Foundation/Utils/HTMLUtils";
import { TreeItemButton } from "@/UserInterface/Components/VirtualTree/TreeItemControl";
import TreeIcon from "./TreeIcon";
import { ExpandButton } from "./ExpandButton";
import { VirtualTreeProps } from "./VirtualTreeProps";
import { ITreeNode } from "./TreeNode";

const DEFAULT_ROW_HEIGHT = 22;

export function VirtualTree(props: VirtualTreeProps) {
  const { onToggleNodeSelect, onToggleNodeExpand, onToggleNodeCheck } = props;

  const TREE_ITEM_HEIGHT =
    readCssVariablePixelNumber("--v-tree-item-height") +
    readCssVariablePixelNumber("--v-tree-item-bottom-margin");

  const data = props.data || [];
  const singleRowHeight =
    props.rowHeight || TREE_ITEM_HEIGHT || DEFAULT_ROW_HEIGHT;

  let List: any;
  function setRef(ref: any) {
    List = ref;

    if (List) {
      // todo: remove once events fired by tree control are handled by parent explorer
      List.recomputeRowHeights();
      List.forceUpdate();
    }
  }

  const renderItem = (item: ITreeNode, keyPrefix: string) => {
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
          return renderItem(child, `${keyPrefix}-${index}`);
        });
      }
    }
    // Label properties
    const { bold, italic, color } = item.label;
    if (item.visible) {
      const onNodeSelect = (): void => {
        onToggleNodeSelect(item.uniqueId, !item.selected);
      };
      const onNodeLabelEnter = (event: KeyboardEvent): void => {
        return HTMLUtils.onEnter(onNodeSelect)(event);
      };

      children.unshift(
        <div className="tree-item center" key="label" role="row">
          <div className="tree-item-comp" role="cell">
            <ExpandButton
              expandable={item.children.length > 0}
              expanded={item.expanded}
              onExpand={onExpand}
              onCollapse={onExpand}
            />
          </div>
          {item.icon && (
            <div className="tree-item-comp" role="cell">
              <TreeIcon
                src={item.icon.path}
                alt={item.icon.description}
                color={item.icon.color}
                size={props.iconSize}
              />
            </div>
          )}
          <div className="tree-item-comp" role="cell">
            <TreeItemButton
              visible={item.checkVisible}
              id={keyPrefix}
              radio={item.isRadio}
              checkbox={!item.isRadio}
              disabled={item.disabled}
              checked={item.checked}
              filter={item.isFilter}
              indeterminate={item.indeterminate}
              onToggleCheck={() =>
                onToggleNodeCheck(item.uniqueId, !item.checked)
              }
            />
          </div>
          <div className="tree-item-comp tree-item-lbl-container">
            <span
              tabIndex={0}
              role="button"
              aria-label="select tree item"
              className={`tree-item-lbl${item.selected ? " selected" : ""}`}
              onClick={onNodeSelect}
              onKeyDown={onNodeLabelEnter}
              style={{
                fontWeight: bold ? "bold" : "normal",
                fontStyle: italic ? "italic" : "normal",
                color: color ? color.hex() : "black",
              }}
            >
              {itemText}
            </span>
          </div>
        </div>
      );
    }

    if (item.visible) {
      return (
        <ul key={keyPrefix} className="list" role="rowgroup">
          <li {...itemProps} className="list-item" role="treeitem">
            {children}
          </li>
        </ul>
      );
    }

    return <React.Fragment {...itemProps}> {children}</React.Fragment>;
  };

  const getExpandedItemCount = (item: ITreeNode) => {
    let count = item.visible ? 1 : 0; // depends on visibility  of containing item

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
    <div className="virtual-tree-container" role="tree">
      <AutoSizer>
        {(params) => {
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
      </AutoSizer>
    </div>
  );
}
