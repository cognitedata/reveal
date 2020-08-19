import * as React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { PrismTheme } from 'prism-react-renderer';
import clsx from 'clsx';

import styles from './styles.module.css';
import oceanicNext from 'prism-react-renderer/themes/oceanicNext';
const defaultCodeTheme = oceanicNext;

export type LivCodeSnippetProps = {
  children: string;
  theme: PrismTheme;
  transformCode: (code: string) => string;
  props: any;
}

export class LiveCodeSnippet extends React.Component<LivCodeSnippetProps> {
  constructor(props: LivCodeSnippetProps) {
    super(props);
  }

  render() {
    const { transformCode, children, theme, props } = this.props;
    return (
      <LiveProvider
        code={children.replace(/^\s+|\s+$/g, '')}
        transformCode={((code) => {
          const fullCode = 
          `const viewer = window.viewer;
          const model = window.model;
          ${(transformCode ? transformCode(code) : code)}`;
          return `<button onClick={() => \{${fullCode}\}}>Run</button>`;
        })}
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
