import * as React from 'react';

import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { atomone } from '@uiw/codemirror-theme-atomone';

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
              resetViewerEventHandlers(viewer);
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

  // const [code, setCode] = useState(props.children);
  let code: string = props.children;
  function setCode(newCode: string) {
    code = newCode;
  }

  return (<><CodeMirror
              value={props.children}
              theme={atomone}
              onChange={setCode}
              basicSetup={{lineNumbers: false, foldGutter: false}}

              extensions={[javascript({})]} /><button onClick={() => onRunCode(code)}>Run</button></>);
};
