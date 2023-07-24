export const getContainer = () => {
  const els = document.getElementsByClassName(
    'cdf-ui-notebook-app-style-scope'
  );
  const el = els.item(0)! as HTMLElement;
  return el;
};
