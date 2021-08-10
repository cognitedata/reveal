import { Colors } from '@cognite/cogs.js';

export const selectStyles = {
  container: (original: React.CSSProperties) => ({
    ...original,
    flex: 1,
    cursor: 'pointer',
    border: `1px solid ${Colors['greyscale-grey4'].hex()}`,
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontWeight: 'bold',
  }),
  option: (original: React.CSSProperties) => ({
    ...original,
    cursor: 'pointer',
  }),
  valueContainer: (original: React.CSSProperties) => ({
    ...original,
    fontWeight: 'normal',
  }),
};
