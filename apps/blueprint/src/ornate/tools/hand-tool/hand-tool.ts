import { KonvaEventObject } from 'konva/lib/Node';

import { CogniteOrnate } from '../../ornate';
import { Tool, ToolType } from '../types';

export class HandTool implements Tool {
  ornate: CogniteOrnate;
  cursor = 'grab';
  name: ToolType = 'HAND';
  constructor(instance: CogniteOrnate) {
    this.ornate = instance;
  }

  onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
    this.ornate.stage.startDrag();
    this.ornate.interactionHandler.setCursor('grabbing');
  };

  onMouseUp = () => {
    this.ornate.interactionHandler.setCursor('grab');
    this.ornate.stage.stopDrag();
  };
}
