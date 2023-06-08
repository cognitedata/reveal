import { styleScope } from 'styles/styleScope';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ms), ms);
  });
}
