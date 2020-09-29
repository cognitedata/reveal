export const styleScope = 'unified-cdf-demo-app-style-scope';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};
