import { styleScope } from './styleScope';

export { styleScope } from './styleScope';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return els.item(0)! as HTMLElement;
};
