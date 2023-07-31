import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';

import { truthy } from '../../utils/types';
import { CogniteOrnate } from '../../ornate';
import { Tool, ToolType } from '../types';

export class SelectTool implements Tool {
  ornate: CogniteOrnate;
  dragStartPosition: Vector2d | undefined;
  highlightAreaNode: Konva.Rect | undefined;
  initialTarget: Konva.Node | undefined;
  name: ToolType = 'SELECT';
  constructor(instance: CogniteOrnate) {
    this.ornate = instance;
  }

  onDestroy = () => {
    this.ornate.transformer.setSelectedNodes([]);
  };

  onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target.name().includes('_anchor')) return; // Ignore transform anchor points
    this.dragStartPosition = this.ornate.stage.getRelativePointerPosition();
    this.initialTarget = e.target;
    const currentTransformerNodeIds = this.ornate.transformer
      .nodes()
      .map((node) => node.id());
    const isHighlighting =
      this.initialTarget.attrs.unselectable === true ||
      !currentTransformerNodeIds.includes(this.initialTarget.id());
    if (isHighlighting) {
      this.highlightAreaNode = new Konva.Rect({
        x: this.dragStartPosition.x,
        y: this.dragStartPosition.y,
        fill: 'rgba(74, 103, 251, 0.3)',
        stroke: 'rgba(74, 103, 251, 0.9)',
        name: 'ornate-highlight-area',
        preventSerialize: true,
      });
      this.ornate.layers.top.add(this.highlightAreaNode);
    }
  };

  onMouseMove = () => {
    if (this.dragStartPosition && this.highlightAreaNode) {
      const currentRelativeMousePos =
        this.ornate.stage.getRelativePointerPosition();
      this.highlightAreaNode.width(
        currentRelativeMousePos.x - (this.dragStartPosition?.x || 0)
      );
      this.highlightAreaNode.height(
        currentRelativeMousePos.y - (this.dragStartPosition?.y || 0)
      );
    }
  };

  onMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target.name().includes('_anchor')) return; // Ignore transform anchor points

    // Determine whether mouse has moved a certain small distance
    const currentRelativeMousePos =
      this.ornate.stage.getRelativePointerPosition();
    const mouseHasMoved =
      Math.abs((this.dragStartPosition?.x || 0) - currentRelativeMousePos.x) +
        Math.abs((this.dragStartPosition?.y || 0) - currentRelativeMousePos.y) >
      2;

    // Get data from selection box and clear (clear all just in case something strange happened)
    const selectionBox = this.highlightAreaNode?.getClientRect();
    this.ornate.stage
      .find('.ornate-highlight-area')
      .forEach((node) => node.destroy());

    // If initial target is unselectable (e.g. stage or unselectable element)
    // ... We want to do an area select, or unselect all
    const initialTargetIsSelectable =
      this.initialTarget?.attrs.unselectable !== true &&
      this.initialTarget?.attrs.locked !== true &&
      // Also check if the group of the intial target is locked
      (this.initialTarget?.attrs.groupId
        ? this.ornate.stage.findOne(`#${this.initialTarget?.attrs.groupId}`)
            .attrs.locked !== true
        : true);

    if (!initialTargetIsSelectable) {
      if (mouseHasMoved) {
        const drawings = Object.values(this.ornate.layers)
          .map((layer) =>
            layer.children?.filter((c) => !c.attrs.preventSerialize)
          )
          .flat();

        const selected = drawings
          .filter((shape) => {
            const shapeRect = shape?.getClientRect();
            if (!shapeRect || !selectionBox) return false;
            return Konva.Util.haveIntersection(selectionBox, shapeRect);
          })
          .filter(truthy);
        this.ornate.transformer.setSelectedNodes(selected, e.evt.shiftKey);
      } else {
        this.ornate.transformer.setSelectedNodes([], e.evt.shiftKey);
      }
      return;
    }

    const initialTargetWasSelected = this.ornate.transformer
      .nodes()
      .some((node) => node.id() === this.initialTarget?.id());

    // If initial target was already selected
    // ... we want to transform. or unselect all shapes
    if (initialTargetWasSelected && this.initialTarget) {
      if (mouseHasMoved) {
        if (this.ornate.transformer.nodes().length > 0) {
          // Let transform happen
        } else {
          // Let transform happen with no other affect
          const drawings = Object.values(this.ornate.layers)
            .map((layer) =>
              layer.children?.filter((c) => !c.attrs.preventSerialize)
            )
            .flat();
          const selected = drawings
            .filter((shape) => {
              const shapeRect = shape?.getClientRect();
              if (!shapeRect || !selectionBox) return false;
              return Konva.Util.haveIntersection(selectionBox, shapeRect);
            })
            .filter(truthy);
          this.ornate.transformer.setSelectedNodes(selected, e.evt.shiftKey);
        }
      } else {
        this.ornate.transformer.setSelectedNodes([], e.evt.shiftKey);
      }
    }

    // If initial target was NOT selected
    // ... we want to let a natural drag happen, or select the shape
    if (!initialTargetWasSelected && this.initialTarget) {
      if (mouseHasMoved) {
        // Let transfomer natural drag happen
      } else {
        this.ornate.transformer.setSelectedNodes(
          [this.initialTarget],
          e.evt.shiftKey
        );
      }
    }
    this.initialTarget = undefined;
  };
}
