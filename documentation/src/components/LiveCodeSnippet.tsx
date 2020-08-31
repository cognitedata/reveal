import * as React from 'react';
import * as THREE from 'three';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { PrismTheme } from 'prism-react-renderer';
import clsx from 'clsx';

import styles from './styles.module.css';
import oceanicNext from 'prism-react-renderer/themes/oceanicNext';
const defaultCodeTheme = oceanicNext;

export type LiveCodeSnippetProps = {
  children: string;
  theme: PrismTheme;
  transformCode: (code: string) => string;
  scope: { [key: string]: any };
  props: any;
}

import { resetViewerEventHandlers } from '../viewerUtilities';

export class LiveCodeSnippet extends React.Component<LiveCodeSnippetProps> {
  constructor(props: LiveCodeSnippetProps) {
    super(props);
  }

  render() {
    const { transformCode, children, theme, scope, props } = this.props;
    return (
      <LiveProvider
        code={children.replace(/^\s+|\s+$/g, '')}
        transformCode={((code) => {
          const fullCode = 
          `
          const viewer = window.viewer;
          const model = window.model;
          const sdk = window.sdk;
          resetViewerEventHandlers(viewer);
          // User code starts here!
          ${(transformCode ? transformCode(code) : code)}`;
          return `<button onClick={() => \{${fullCode}\}}>Run</button>`;
        })}
        scope={{resetViewerEventHandlers, THREE, ...scope}}
        theme={theme || defaultCodeTheme}
        {...props}>
        <div
          className={clsx(
            styles.codeSnippetHeader,
            styles.codeSnippetEditorHeader,
          )}>
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
}
