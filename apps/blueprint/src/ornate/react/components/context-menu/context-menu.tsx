import Konva from 'konva';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import intersectionWith from 'lodash/intersectionWith';
import uniq from 'lodash/uniq';

import { CogniteOrnate } from '../../../ornate';
import { OrnateShapeType } from '../../../shapes';

import {
  ColorizeControl,
  ControlProps,
  DeleteControl,
  DocumentControl,
  FillControl,
  MoveControl,
  StrokeControl,
  TextControl,
  LockControl,
} from './controls';
import { ContextMenuWrapper } from './elements';

export type OrnateContextMenuProps = {
  instance?: CogniteOrnate;
  additionalControls?: (
    shapeType: OrnateShapeType[]
  ) => React.FC<ControlProps>[];
};

type Tag =
  | 'FILL'
  | 'STROKE'
  | 'MOVABLE'
  | 'DOCUMENT'
  | 'COLORIZE'
  | 'DELETE'
  | 'TEXT'
  | 'LOCKABLE';

const typeToTags: Record<OrnateShapeType, Tag[]> = {
  CIRCLE: ['FILL', 'STROKE', 'MOVABLE', 'DELETE'],
  RECT: ['FILL', 'STROKE', 'MOVABLE', 'DELETE'],
  LINE: ['STROKE', 'MOVABLE', 'DELETE'],
  GROUP: ['DELETE'],
  TEXT: ['TEXT', 'FILL', 'STROKE', 'MOVABLE', 'DELETE'],
  FILE_URL: ['DOCUMENT', 'MOVABLE', 'LOCKABLE', 'DELETE'],
  IMAGE: ['DELETE', 'COLORIZE'],
};

const tagToComponent: Record<Tag, React.FC<ControlProps> | null> = {
  DELETE: DeleteControl,
  FILL: FillControl,
  STROKE: StrokeControl,
  TEXT: TextControl,
  MOVABLE: MoveControl,
  DOCUMENT: DocumentControl,
  COLORIZE: ColorizeControl,
  LOCKABLE: LockControl,
};

export const ContextMenu: React.FC<OrnateContextMenuProps> = ({
  instance,
  additionalControls,
}) => {
  const [selectedNodes, setSelectedNodes] = useState<Konva.Node[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [xy, setXY] = useState([0, 0]);

  const updatePosition = useCallback(() => {
    if (!instance) return;
    const box = instance.transformer.getClientRect();
    setXY([box.x, box.y]);
  }, [instance]);

  const onNodeUpdate = useCallback(() => {
    if (!instance) return;
    setSelectedNodes(instance.transformer.nodes());
    setIsMoving(false);
    updatePosition();
  }, [instance, updatePosition]);

  const onDragStart = () => {
    setIsMoving(true);
  };

  const onDragEnd = useCallback(() => {
    updatePosition();
    setIsMoving(false);
  }, [updatePosition]);

  const onMouseWheel = useCallback(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    if (!instance) return () => null;
    setTimeout(() => {
      instance.transformer.on('nodes-update', onNodeUpdate);
      instance.transformer.on('dragstart transformstart', onDragStart);
      instance.transformer.on('dragend transformend', onDragEnd);
      instance.stage.on('wheel', onMouseWheel);
    }, 1000);
    return () => {
      instance.transformer.off('nodes-update', onNodeUpdate);
      instance.transformer.off('dragstart transformstart', onDragStart);
      instance.transformer.off('dragend transformend', onDragEnd);
      instance.stage.off('wheel', onMouseWheel);
    };
  }, [instance, onDragEnd, onMouseWheel, onNodeUpdate]);

  const shapeTypes = useMemo(() => {
    return uniq(
      (selectedNodes || [])
        .map((node) => {
          if (node.attrs.type === 'GROUP') {
            const childrenTags = (node as Konva.Group).children?.map(
              (n) => n.attrs.type as OrnateShapeType
            );
            return childrenTags;
          }
          return [node.attrs.type as OrnateShapeType];
        })
        .flat()
        .filter(Boolean) as OrnateShapeType[]
    );
  }, [selectedNodes]);

  const relevantTags = useMemo(() => {
    const tags = intersectionWith(
      ...shapeTypes.map((type) => typeToTags[type])
    );
    return tags;
  }, [selectedNodes, shapeTypes]);

  if (!selectedNodes || selectedNodes.length === 0 || isMoving) {
    return null;
  }

  const renderActions = () => {
    return relevantTags.map((tag) => {
      if (!instance) return null;

      const ActionComponent = tagToComponent[tag];
      if (!ActionComponent) return <div>{tag}</div>;

      return (
        <ActionComponent key={tag} nodes={selectedNodes} instance={instance} />
      );
    });
  };

  const renderAdditionalActions = () => {
    if (!additionalControls) return [];
    return additionalControls(shapeTypes).map((ActionComponent, i) => {
      if (!instance) return null;

      return (
        // eslint-disable-next-line react/no-array-index-key
        <ActionComponent key={i} nodes={selectedNodes} instance={instance} />
      );
    });
  };

  return (
    <ContextMenuWrapper
      className="ornate-context-menu"
      style={{
        transform: `translate(${Math.max(xy[0], 8)}px, ${Math.max(
          xy[1],
          8
        )}px)`,
      }}
    >
      {renderActions()}
      {renderAdditionalActions()}
    </ContextMenuWrapper>
  );
};
