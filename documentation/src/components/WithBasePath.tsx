/*
 * Copyright 2020 Cognite AS
 */

import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * Used to overcome reveal problems with importing wasm/worker code.
 * Without <base> html tag reveal tries to load these files relatively to current href
 */
export default function WithBasePath() {
  if (typeof document === 'undefined') {
    return <div />
  }

  const BASE_TAG_ID = 'basetagid'
  if (document.getElementById(BASE_TAG_ID)) {
    return <div></div>
  }
  const base: HTMLBaseElement = document.createElement('base');
  base.href = useBaseUrl('/');
  base.id = BASE_TAG_ID

  const head = document.getElementsByTagName('head')[0]
  if (head) {
    head.appendChild(base);
  }
  return <div></div>;
}
