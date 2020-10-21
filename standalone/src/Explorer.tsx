import React, {useCallback} from "react";
import { ExplorerPropType, ITreeNode } from "@cognite/node-visualizer";
import { withStyles } from '@material-ui/core/styles';
import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const ExplorerTab = withStyles(theme => ({
  root: {
    minWidth: 60,
    flex: 1,
  }
}))(Tab);
const ExplorerTreeItem = withStyles(theme => ({
  label: {
    textAlign: 'left',
  }
}))(TreeItem)

const renderLabel = (item: ITreeNode, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => {
  return item.checkable
    ? (<span>
        <input type="checkbox" checked={item.checked} onChange={onChange} />
        { item.name }
      </span>)
    : item.name
}

const renderItems = (items: ITreeNode[], onChange: (nodeId: string) => void) => {
  return items.map(item => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.nativeEvent.stopImmediatePropagation();

      onChange(item.uniqueId)
    }
    return (
      <ExplorerTreeItem key={item.uniqueId} nodeId={item.uniqueId} label={renderLabel(item, handleChange)}>
        { item.children.length ? renderItems(item.children, onChange) : null }
      </ExplorerTreeItem>
    )
  })
}

const renderTabs = (items: any[]) => {
  return items.map(item => <ExplorerTab key={item.name} label={item.name}  />)
}

export const Explorer: React.FC<ExplorerPropType> = (
  { data, tabs, selectedTabIndex, onTabChange, onToggleVisible }: ExplorerPropType
) => {
  const handleChange = useCallback((event: React.ChangeEvent<{}>, tabIndex: number) => {
    onTabChange(tabIndex);
  }, [onTabChange]);

  return (
    <div>
      <Tabs
        value={selectedTabIndex}
        onChange={handleChange}
      >
        {renderTabs(tabs)}
      </Tabs>
      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {renderItems(data, onToggleVisible)}
      </TreeView>
    </div>
  );
};
