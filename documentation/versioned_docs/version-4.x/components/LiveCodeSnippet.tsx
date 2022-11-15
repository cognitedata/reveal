import * as React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import clsx from 'clsx';

import styles from './styles.module.css';
import oceanicNext from 'prism-react-renderer/themes/oceanicNext';
import useBaseUrl from '@docusaurus/useBaseUrl';
const defaultCodeTheme = oceanicNext;

// Replacement for "import { customScope } from './customScope'" to avoid
// build issues with React Server-side Rendering
// which fails due to "window" not being defined in NodeJS
const customScope =
  typeof window === 'undefined'
    ? {
        urls: [],
      }
    : require('./customScope').customScope;

export type LiveCodeSnippetProps = {
  children: string;
};

export function LiveCodeSnippet(props: LiveCodeSnippetProps) {
  const scope = {
    ...customScope,
    ...Object.keys(customScope.urls).reduce((acc, key) => {
      acc[key] = useBaseUrl(customScope.urls[key]);
      return acc;
    }, {} as any),
  };

  const { children } = props;
  return (
    <LiveProvider
      code={children}
      transpileOptions={{
        transforms: {
          classes: false,
          asyncAwait: false
        }
      }}
      transformCode={(code: string) => {
        const fullCode = `
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
              if (model instanceof Cognite3DModel) {
                resetCognite3DModel(model);
              }
            } else {
              alert('Login is required to run examples');
              return;
            }
            // User code starts here!
            ${code}`;
        return `
          <button
            type="button"
            className="button button--primary button--lg"
            onClick={() => \{${fullCode}\}}
          >
            Run
          </button>
        `;
      }}
      scope={{ ...scope }}
      theme={defaultCodeTheme}
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
