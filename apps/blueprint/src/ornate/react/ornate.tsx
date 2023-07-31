import React, { useRef, useEffect, useState, useMemo } from 'react';

import { OrnateShapeConfig, Shape } from '../shapes';
import { CogniteOrnate } from '../ornate';
import { ToolType } from '../tools';

import { ContextMenu, OrnateContextMenuProps } from './components';
import { OrnateContext } from './ornate.context';

export type CogniteOrnateProps = {
  shapes?: Shape<OrnateShapeConfig>[];
  children?: React.ReactElement | React.ReactElement[];
  activeTool?: ToolType;
  id?: string;
  onReady?: (instance: CogniteOrnate) => void;
  onShapesReady?: (instance: CogniteOrnate) => void;
  contextMenuProps?: Omit<OrnateContextMenuProps, 'instance'>;
};

export const Ornate = ({
  shapes,
  onReady,
  onShapesReady,
  activeTool = 'HAND',
  children,
  id = 'cognite-ornate',
  contextMenuProps,
}: CogniteOrnateProps) => {
  const ornate = useRef<CogniteOrnate>();
  const [isReady, setIsReady] = useState(false);
  const [isShapesReady, setIsShapesReady] = useState(false);
  const [addedShapes, setAddedShapes] = useState<{
    [id: string]: Shape<OrnateShapeConfig>;
  }>({});
  // Setup ornate constructor
  useEffect(() => {
    if (ornate.current) return;
    ornate.current = new CogniteOrnate({
      container: `#${id}`,
      defaultTool: activeTool,
    });

    setIsReady(true);
    if (onReady) {
      onReady(ornate.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isReady) return;
    if (!shapes) return;
    if (!ornate.current) return;

    // Add new shapes
    const shapesToAdd = shapes.filter((shape) => !addedShapes[shape.config.id]);
    ornate.current.addShape(shapesToAdd);

    // Remove old shapes
    const shapesToRemove = Object.keys(addedShapes).filter((shapeId) =>
      shapes.every((s) => s.config.id !== shapeId)
    );
    shapesToRemove.forEach((shapeId) => {
      addedShapes[shapeId].shape.destroy();
    });

    // Reset state based on new shapes
    setAddedShapes(
      shapes.reduce(
        (acc, shape) => ({
          ...acc,
          [shape.config.id]: shape,
        }),
        {}
      )
    );

    if (!isShapesReady) {
      setIsShapesReady(true);
      if (onShapesReady) {
        onShapesReady(ornate.current);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes, isReady]);

  useEffect(() => {
    if (ornate.current && activeTool) {
      ornate.current.setActiveTool(activeTool);
    }
  }, [activeTool]);

  const providerValue = useMemo(
    () => ({
      ornateInstance: isShapesReady ? ornate.current || null : null,
    }),
    [isShapesReady, ornate]
  );

  return (
    <OrnateContext.Provider value={providerValue}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isReady && (
          <ContextMenu instance={ornate.current} {...contextMenuProps} />
        )}
        <div id={id} style={{ width: '100%', height: '100%' }} />
        {children}
      </div>
    </OrnateContext.Provider>
  );
};
