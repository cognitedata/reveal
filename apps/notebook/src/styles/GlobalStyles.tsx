import highlight from 'highlight.js/styles/dracula.css';
import monacoStyles from 'monaco-editor/dev/vs/editor/editor.main.css';

import { useGlobalStyles } from '@cognite/cdf-utilities';
import { Loader, Tooltip as CogsTooltip, Modal } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs-without-fonts.css';

import { getContainer } from '../utils';

// This will override the appendTo prop on all Tooltips used from cogs
CogsTooltip.defaultProps = {
  ...CogsTooltip.defaultProps,
  appendTo: getContainer,
};
Modal.defaultProps = {
  ...Modal.defaultProps,
  getContainer,
};

export default function GlobalStyles(props: { children: React.ReactNode }) {
  const didLoadStyles = useGlobalStyles([cogsStyles, monacoStyles, highlight]);

  if (!didLoadStyles) {
    return <Loader />;
  }

  return (
    <div className="cdf-ui-notebook-app-style-scope">{props.children}</div>
  );
}
