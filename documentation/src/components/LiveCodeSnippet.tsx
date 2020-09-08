import * as React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { PrismTheme } from 'prism-react-renderer';
import clsx from 'clsx';

import styles from './styles.module.css';
import oceanicNext from 'prism-react-renderer/themes/oceanicNext';
import { customScope } from './customScope';
import useBaseUrl from '@docusaurus/useBaseUrl';
const defaultCodeTheme = oceanicNext;

export type LiveCodeSnippetProps = {
  children: string;
  theme: PrismTheme;
  transformCode: (code: string) => string;
  scope?: Record<string, any>;
};

function prependedCodeFn({ resetViewerEventHandlers }: typeof customScope) {
  // # body-start #

  // make these things to be available in live-editor
  const viewer = window.viewer;
  const model = window.model;
  const sdk = window.sdk;

  const viewerEl = document.getElementById('demo-wrapper');
  if (viewerEl) {
    viewerEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  if (viewer) {
    resetViewerEventHandlers(viewer);
  } else {
    alert('Login is required to run examples');
    return;
  }
}

function getPrependedCode() {
  const startSymbol = '# body-start #';
  const fnString = prependedCodeFn.toString();
  return fnString
    .slice(
      fnString.indexOf(startSymbol) + startSymbol.length,
      fnString.lastIndexOf('}')
    )
    .trim();
}

export function LiveCodeSnippet(props: LiveCodeSnippetProps) {
  const scope = {
    ...customScope,
    ...Object.keys(customScope.urls).reduce((acc, key) => {
      acc[key] = useBaseUrl(customScope.urls[key]); // that's the hook I needed
      return acc;
    }, {} as any),
  };

  const { transformCode, children, theme } = props;
  return (
    <LiveProvider
      code={children}
      transformCode={(code) => {
        const fullCode = `
            ${getPrependedCode()}
            // User code starts here!
            ${transformCode ? transformCode(code) : code}`;

        return `<button onClick={() => \{${fullCode}\}}>Run</button>`;
      }}
      scope={{ ...scope }}
      theme={theme || defaultCodeTheme}
    >
      <div
        className={clsx(
          styles.codeSnippetHeader,
          styles.codeSnippetEditorHeader
        )}
      >
        Live Editor
      </div>
      <LiveEditor className={styles.codeSnippetEditor} />
      <div className={styles.codeSnippetPreview}>
        <LivePreview />
        <LiveError />
      </div>
    </LiveProvider>
  );
}
