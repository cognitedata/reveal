/* eslint react/jsx-key: 0 */
import React from 'react'
import Highlight, {defaultProps} from 'prism-react-renderer'
import {LiveProvider, LiveEditor, LiveError, LivePreview} from 'react-live'
import {mdx} from '@mdx-js/react'

export default ({children, className, live, render}) => {
  const language = className.replace(/language-/, '')
  const components = { mdx, jalla: 'abc' };
  if (live) {
    return (
      <div style={{marginTop: '40px', backgroundColor: 'black'}}>
        <LiveProvider
          scope={components}
          code={children.trim()}
transformCode={code => '/** @jsx mdx */' + code}
        >
          <LiveEditor />
          <LiveError />
          <LivePreview />
        </LiveProvider>
      </div>
    )
  }
  if (render) {
    return (
      <div style={{marginTop: '40px'}}>
        <LiveProvider code={children}>
          <LivePreview />
        </LiveProvider>
      </div>
    )
  }
  return (
    <Highlight {...defaultProps} code={children.trim()} language={language}>
      {({className, style, tokens, getLineProps, getTokenProps}) => (
        <pre className={className} style={{...style, padding: '20px'}}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({line, key: i})}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({token, key})} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}
