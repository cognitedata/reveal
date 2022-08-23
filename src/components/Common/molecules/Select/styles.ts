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
    wordBreak: 'break-word',
    padding: '8px 4px !important',
    boxSizing: 'border-box',
    width: '95%',
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
    minWidth: '214px',
  }),
  menu: () => ({
    marginTop: '4px',
  }),
  indicatorContainer: () => ({
    display: 'none',
  }),
};
