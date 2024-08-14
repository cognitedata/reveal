import * as React from 'react';

import CodeMirror from '@uiw/react-codemirror';
import { syntaxTree } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { material } from '@uiw/codemirror-theme-material';
import styles from './styles.module.css';
import clsx from 'clsx';

import { linter, Diagnostic } from "@codemirror/lint";

function createLintProvider(setHasError: (hasError: boolean) => void) {
  function lintProvider(view: EditorView): readonly Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    let anyError = false;
    syntaxTree(view.state).iterate({
      enter: (node) => {
        if (node.type.isError) {
          anyError = true;
          diagnostics.push({
            from: node.from,
            to: node.to,
            severity: "error",
            message: "Syntax error",
          });
        }
      },
    });

    setHasError(anyError);

    return diagnostics;
  }

  return lintProvider;
}

export type LiveCodeSnippetProps = {
  children: string;
};

export const LiveCodeSnippet = (props: LiveCodeSnippetProps) => {
  const lintProvider = createLintProvider(_ => {});

  return (<>
    <div className={clsx(styles.codeSnippetHeader,
                         styles.codeSnippetEditorHeader)}>
      Live Editor
    </div>
    <CodeMirror
      value={props.children}
      theme={material}
      basicSetup={{ lineNumbers: false,
                    foldGutter: false,
                    autocompletion: false,
                    highlightActiveLine: false }}
      className={styles.cmEditor}
      extensions={[javascript({}), linter(lintProvider)]} />
    <button  type="button"
             disabled={true}
             className={clsx("button button--danger", styles.runButton)}>
      Running code not supported for version 2
    </button>
  </>);
};

export default LiveCodeSnippet;
