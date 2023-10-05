/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import rcTabsStyles from 'rc-tabs/assets/index.css';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import {
  Dropdown as CogsDropdown,
  Tooltip as CogsTooltip,
  DateRange,
  Drawer,
  Loader,
  Modal,
} from '@cognite/cogs.js';
import cogs9Styles from '@cognite/cogs.js/dist/cogs.css';

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

// This will override the appendTo prop on all Dropdown used from cogs
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
CogsDropdown.defaultProps = {
  ...CogsDropdown.defaultProps,
  appendTo: getContainer,
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
Drawer.defaultProps = {
  ...Drawer.defaultProps,
  getContainer,
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
DateRange.defaultProps = {
  ...DateRange.defaultProps,
  getContainer,
};

export default function GlobalStyles({
  children,
}: {
  children: React.ReactNode;
}) {
  const didLoadStyles = useGlobalStyles([cogs9Styles, rcTabsStyles]);

  if (!didLoadStyles) {
    return <Loader />;
  }

  return <div className={STYLE_SCOPE}>{children}</div>;
}
