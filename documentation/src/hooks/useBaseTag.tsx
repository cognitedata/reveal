/*
 * Copyright 2020 Cognite AS
 */

import React, { useEffect } from 'react';
// @ts-ignore it mentioned in docs, but where is the type references - no idea.
import useBaseUrl from '@docusaurus/useBaseUrl';

/**
 * Used to overcome reveal problems with importing wasm/worker code.
 * Without <base> html tag reveal tries to load these files relatively to current href
 *
 * (!) That base tag breaks relative links functionality for markdown headers. (e.g. /doc#header1)
 * So it's impossible to have headers on examples docs (they won't work)
 * That's all complete lame and reveal must be fixed somehow.
 */
export function useBaseTag(demoQuerySelector: string) {
  const baseUrl = useBaseUrl('/');

  useEffect(() => {
    if (typeof document === 'undefined') {
      return () => {};
    }

    const BASE_TAG_ID = 'basetagid';
    const baseTag = document.getElementById(BASE_TAG_ID);

    if (!baseTag) {
      const base: HTMLBaseElement = document.createElement('base');
      base.href = baseUrl;
      base.id = BASE_TAG_ID;

      const head = document.getElementsByTagName('head')[0];

      if (document.querySelector(demoQuerySelector)) {
        head.appendChild(base);
      }
    }

    return () => {
      // to wait until DOM update happens
      setTimeout(() => {
        const baseTag = document.getElementById(BASE_TAG_ID);
        if (baseTag && !document.querySelector(demoQuerySelector)) {
          baseTag.remove();
        }
      });
    };
  });
}
