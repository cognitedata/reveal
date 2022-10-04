import { Colors } from '@cognite/cogs.js';
import { CanvasBlockItem } from 'components/canvas-block';

export const blocks: CanvasBlockItem[] = [
  {
    icon: 'DataTable',
    iconColor: Colors['border--status-success--strong'],
    label: 'Table',
    type: 'raw-table',
  },
  {
    icon: 'Refresh',
    iconColor: Colors['border--status-neutral--strong'],
    label: 'Transformation',
    type: 'transformation',
  },
  {
    icon: 'Folder',
    label: 'Data set',
    type: 'data-set',
  },
  {
    icon: 'InputData',
    label: 'Extract from source',
    type: 'extraction-pipeline',
  },
  {
    icon: 'GraphTree',
    label: 'Entity matching',
    type: 'entity-matching',
  },
];
