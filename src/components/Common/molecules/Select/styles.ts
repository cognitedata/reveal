import { Colors } from '@cognite/cogs.js';

// I haven't managed to make it work without !important
export const selectStyles = {
  container: (original: React.CSSProperties) => ({
    ...original,
    flex: 1,
    cursor: 'pointer',
  }),
  option: () => ({
    cursor: 'pointer !important',
  }),
  valueContainer: (original: React.CSSProperties) => ({
    ...original,
    fontWeight: 'normal',
    padding: 0,
  }),
  control: () => ({
    border: `2px solid ${Colors['greyscale-grey4'].hex()} !important`,
    borderRadius: '6px !important',
    boxSizing: 'border-box',
    fontWeight: 'bold',
  }),
  placeholder: () => ({
    color: Colors['greyscale-grey6'].hex(),
  }),
};
