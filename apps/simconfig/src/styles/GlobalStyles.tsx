/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useGlobalStyles } from '@cognite/cdf-utilities';
import { Tooltip as CogsTooltip, Loader, Modal } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';

const STYLE_SCOPE = 'cdf-simint-ui-style-scope';

export const getContainer = () => {
  const els = document.getElementsByClassName(STYLE_SCOPE);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const el = els.item(0)! as HTMLElement;
  return el;
};

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

export default function GlobalStyles({
  children,
}: {
  children: React.ReactNode;
}) {
  const didLoadStyles = useGlobalStyles([cogsStyles]);

  if (!didLoadStyles) {
    return <Loader />;
  }

  return <div className={STYLE_SCOPE}>{children}</div>;
}
