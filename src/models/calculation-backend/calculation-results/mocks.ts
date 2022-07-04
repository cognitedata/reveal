import { SourceOption } from 'components/NodeEditor/V2/types';

export const mockSourceList: SourceOption[] = [
  {
    label: 'Source 1',
    value: 'a',
    color: '#F00',
    type: 'timeseries',
  },
  {
    label: 'Source 2',
    value: 'b',
    color: '#0F0',
    type: 'timeseries',
  },
  {
    label: 'Source 3',
    value: 'c',
    color: '#00F',
    type: 'workflow',
  },
  {
    label: 'Very Long Source Name to test how the browser will react to it',
    value: 'd',
    color: '#FF0',
    type: 'workflow',
  },
];
