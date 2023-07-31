/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import Konva from 'konva';
import { useMetrics } from '@cognite/metrics';
import { Node, NodeConfig } from 'konva/lib/Node';
import { UpdateKeyType } from '@cognite/ornate';
import { RuleSet } from 'typings';

import {
  ThicknessControl,
  FontSizeControl,
  ShapeStyleControl,
  DocumentName,
  AssetName,
} from './ContextMenuItems';
import { getPositionX } from './ContextMenuItems/utils';
import { ContextMenuWrapper } from './elements';
import { ImageColoroizer } from './ContextMenuItems/ImageColoroizer';
import { ResetFilters } from './ContextMenuItems/ResetFilters';

type ContextMenuProps = {
  selectedNode: Konva.Node;
  onDeleteNode: (node: Konva.Node) => void;
  updateShape: (
    shape: Node<NodeConfig>,
    updateKey: UpdateKeyType,
    updateValue: string | number
  ) => void;
  ruleSets?: RuleSet[];
  shapeRuleSetsIds?: string[];
  onClickRuleSet: (nextRuleSetId: string) => void;
  onNewRuleSet: () => void;
};

const ContextMenu = ({
  selectedNode,
  onDeleteNode,
  updateShape,
  ruleSets,
  shapeRuleSetsIds,
  onClickRuleSet,
  onNewRuleSet,
}: ContextMenuProps) => {
  const isDocumentGroup =
    selectedNode.getType() === 'Group' &&
    selectedNode.attrs.type !== 'workorder';
  const metrics = useMetrics('ContextMenu');
  const ref = useRef<HTMLDivElement>(null);
  const [x, setX] = useState<number>(
    getPositionX(
      selectedNode.getClientRect().x,
      selectedNode.getClientRect().width,
      ref.current?.clientWidth || 0,
      isDocumentGroup
    )
  );
  const [y, setY] = useState<number>(selectedNode.getClientRect().y);
  const [fill, setFill] = useState<boolean>(false);
  const [toggleStyleMenu, setToggleStyleMenu] = useState<boolean>(false);
  const [showColorizeMenu, setShowColorizeMenu] = useState(false);
  const [hide, setHide] = useState<boolean>(false);

  const isAsset =
    selectedNode.attrs.metadata &&
    selectedNode.attrs.metadata.type &&
    selectedNode.attrs.metadata.type === 'asset';

  const onMouseWheel = useCallback(() => {
    const { x: newX, y: newY, width } = selectedNode.getClientRect();
    setX(
      getPositionX(newX, width, ref.current?.clientWidth || 0, isDocumentGroup)
    );
    setY(newY);
  }, [isDocumentGroup, selectedNode]);

  useEffect(() => {
    document.addEventListener('wheel', onMouseWheel);
    return () => {
      document.removeEventListener('wheel', onMouseWheel);
    };
  }, [onMouseWheel, selectedNode]);

  useEffect(() => {
    // Set drag event listener to hide the context menu accordingly
    selectedNode.on('dragstart', () => {
      setHide(true);
    });
    selectedNode.on('dragend', () => {
      const { x, width, y } = selectedNode.getClientRect();
      setHide(false);
      setX(
        getPositionX(x, width, ref.current?.clientWidth || 0, isDocumentGroup)
      );
      setY(y);
    });
    return () => {
      selectedNode.off('dragstart');
      selectedNode.off('dragend');
    };
  }, [isDocumentGroup, selectedNode]);

  useEffect(() => {
    // We need to reposition the contextmenu whenever the stage view moves
    setX(
      getPositionX(
        selectedNode.getClientRect().x,
        selectedNode.getClientRect().width,
        ref.current?.clientWidth || 0,
        isDocumentGroup
      )
    );
    setY(selectedNode.getClientRect().y);
  }, [isDocumentGroup, selectedNode]);

  const toggleFillStyleMenu = () => {
    if (!toggleStyleMenu) {
      setToggleStyleMenu(!toggleStyleMenu);
    }
    setFill(true);
  };

  const toggleStrokeStyleMenu = () => {
    if (!toggleStyleMenu) {
      setToggleStyleMenu(!toggleStyleMenu);
    }
    setFill(false);
  };

  const getAssetName = useCallback(() => {
    if (selectedNode.attrs.metadata && selectedNode.attrs.metadata.name) {
      return selectedNode.attrs.metadata.name;
    }
    return '';
  }, [selectedNode]);

  const thicknessControl = (
    <ThicknessControl
      key="ornateContextMenuThicknessControl"
      selectedNode={selectedNode}
      metrics={metrics}
      updateShape={updateShape}
    />
  );

  const strokeControlButton = (
    <Button
      key="ornateContextMenuStrokeControlButton"
      type="ghost"
      aria-label="strokeControlButton"
      icon="Experiment"
      onClick={toggleStrokeStyleMenu}
    />
  );

  const fillControlButton = (
    <Button
      key="ornateContextMenufillControlButton"
      type="ghost"
      aria-label="fillControlButton"
      icon="ColorPalette"
      onClick={toggleFillStyleMenu}
    />
  );

  const resetFiltersButton = <ResetFilters selectedNode={selectedNode} />;

  const fontSizeControl = (
    <FontSizeControl
      key="ornateContextMenuFontSizeControl"
      selectedNode={selectedNode}
      metrics={metrics}
      updateShape={updateShape}
    />
  );

  const assetNameMenuItem = <AssetName assetName={getAssetName()} />;

  const workOrderExternalIdMenuItem = (
    <DocumentName
      key={`ornateContextMenu${selectedNode.attrs.workOrderExternalId}`}
      documentName={selectedNode.attrs.workOrderExternalId}
    />
  );

  const deleteNodeButton = (
    <Button
      key="ornateContextMenuDeleteButton"
      type="ghost-danger"
      aria-label="deleteOrnateNodeButton"
      icon="Delete"
      onClick={() => onDeleteNode(selectedNode)}
    />
  );

  const colorizeControlButton = (
    <Button
      key="ornateContextMenuColorizeControlButton"
      type="ghost"
      aria-label="fillControlButton"
      icon="ColorPalette"
      onClick={() => {
        setShowColorizeMenu(true);
      }}
    />
  );

  const ruleControlButton = (
    <Dropdown
      content={
        <Menu>
          <Menu.Header>Rule Sets</Menu.Header>
          {ruleSets?.map((r) => (
            <Menu.Item
              key={r.id}
              onClick={() => {
                onClickRuleSet(r.id);
              }}
              appendIcon={
                shapeRuleSetsIds?.includes(r.id) ? 'Checkmark' : undefined
              }
            >
              {r.name}
            </Menu.Item>
          ))}
          <Menu.Divider />
          <Menu.Item
            onClick={() => {
              onNewRuleSet();
            }}
          >
            Manage rule sets
          </Menu.Item>
        </Menu>
      }
    >
      <Button
        key="ruleControlButton"
        type="ghost"
        aria-label="fillControlButton"
        icon="Function"
      />
    </Dropdown>
  );

  const getMenuItems = useCallback(() => {
    if (isDocumentGroup) {
      return [deleteNodeButton];
    }
    if (isAsset) {
      return [assetNameMenuItem];
    }

    switch (selectedNode.attrs.type) {
      case 'text':
        return [fontSizeControl, fillControlButton, deleteNodeButton];
      case 'line':
        return [
          thicknessControl,
          strokeControlButton,
          deleteNodeButton,
          ruleControlButton,
        ];
      case 'stamp':
        return [colorizeControlButton, resetFiltersButton, deleteNodeButton];
      case 'circle':
      case 'rect':
        return [
          thicknessControl,
          strokeControlButton,
          fillControlButton,
          deleteNodeButton,
          ruleControlButton,
        ];
      default:
        return undefined;
    }
  }, [
    isDocumentGroup,
    isAsset,
    selectedNode.attrs.type,
    deleteNodeButton,
    assetNameMenuItem,
    fontSizeControl,
    fillControlButton,
    thicknessControl,
    strokeControlButton,
    workOrderExternalIdMenuItem,
  ]);

  const commonMenuItems = getMenuItems();

  // used to place context menu right on top of a document
  const correctMarginTop = `${-2 - (ref.current?.clientHeight || 0)}px`;
  const groupStyles = {
    marginTop: correctMarginTop,
  };

  return (
    <ContextMenuWrapper
      ref={ref}
      style={{
        transform: `translate(${x}px, ${y}px)`,
        ...(isDocumentGroup && groupStyles),
        ...(hide && { display: 'none' }),
      }}
    >
      {toggleStyleMenu && (
        <ShapeStyleControl
          selectedNode={selectedNode}
          metrics={metrics}
          fill={fill}
          updateShape={updateShape}
        />
      )}
      {showColorizeMenu && <ImageColoroizer selectedNode={selectedNode} />}
      {commonMenuItems && (
        <Menu className="ornate-context-menu">{commonMenuItems}</Menu>
      )}
    </ContextMenuWrapper>
  );
};

export default ContextMenu;
