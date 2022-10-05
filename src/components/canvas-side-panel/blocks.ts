import { CanvasBlockItem } from 'components/canvas-block';

export const blocks: CanvasBlockItem[] = [
  {
    label: 'Raw table',
    type: 'raw-table',
  },
  {
    label: 'Data sets',
    type: 'data-set',
  },
  {
    label: 'Data from source',
    type: 'extraction-pipeline',
  },
  {
    label: 'Transformation',
    type: 'transformation',
  },
  {
    label: 'Entity matching',
    type: 'entity-matching',
  },
  {
    label: 'Diagrams',
    type: 'engineering-diagram',
  },
];
