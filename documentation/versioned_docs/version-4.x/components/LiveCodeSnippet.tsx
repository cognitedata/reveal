import * as React from 'react';
import { useState } from 'react';

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

function transformCode(code: string): string {
  return `
            // make these things to be available in live-editor
            const viewer = window.viewer;
            const model = window.model;
            const sdk = window.sdk;

            const viewerEl = document.getElementById('demo-wrapper');
            if (viewerEl) {
              viewerEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }

            if (viewer) {
              if (model instanceof CogniteCadModel) {
                resetCogniteCadModel(model);
              }
            } else {
              alert('Login is required to run examples');
              return;
            }
            // User code starts here!
            ${code}`;
}

function onRunCode(code: string) {
  const transformedCode = transformCode(code);
  const customScopeNames = Object.keys(customScope);
  const customScopeValues = Object.values(customScope);
  new Function(...customScopeNames, transformedCode)(...customScopeValues);
}

export const LiveCodeSnippet = (props: LiveCodeSnippetProps) => {
  let code: string = props.children;
  function setCode(newCode: string) {
    code = newCode;
  }

  let [buttonEnabled, setButtonEnabled] = useState(true);

  const lintProvider = createLintProvider(v => setButtonEnabled(!v));

  return (<>
    <div className={clsx(styles.codeSnippetHeader,
                         styles.codeSnippetEditorHeader)}>
      Live Editor
    </div>
    <CodeMirror
      value={props.children}
      theme={material}
      onChange={setCode}
      basicSetup={{ lineNumbers: false,
                    foldGutter: false,
                    autocompletion: false,
                    highlightActiveLine: false }}
      className={styles.cmEditor}
      extensions={[javascript({}), linter(lintProvider)]} />
    <button type="button"
            disabled={!buttonEnabled}
            onClick={() => onRunCode(code)}
            className={clsx("button button--primary button--lg", styles.runButton)}>
      Run
    </button>
  </>);
};

export default LiveCodeSnippet;
