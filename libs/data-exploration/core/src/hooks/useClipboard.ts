import { useCallback, useEffect, useState } from 'react';

import copy from 'copy-to-clipboard';

export interface UseClipboardOptions {
  /**
   * timeout delay (in ms) to switch back to initial state once copied.
   */
  timeout?: number;
  /**
   * Set the desired MIME type
   */
  format?: string;
}

/**
 * React hook to copy content to clipboard
 *
 *
 * @param {Number} [optionsOrTimeout=1500] optionsOrTimeout - delay (in ms) to switch back to initial state once copied.
 * @param {Object} optionsOrTimeout
 * @param {string} optionsOrTimeout.format - set the desired MIME type
 * @param {number} optionsOrTimeout.timeout - delay (in ms) to switch back to initial state once copied.
 *
 *
 */
export function useClipboard(
  optionsOrTimeout: number | UseClipboardOptions = {}
) {
  const [hasCopied, setHasCopied] = useState(false);

  const { timeout = 1500, ...copyOptions } =
    typeof optionsOrTimeout === 'number'
      ? { timeout: optionsOrTimeout }
      : optionsOrTimeout;

  const onCopy = useCallback(
    (value: string) => {
      const didCopy = copy(`${value}`, copyOptions);
      setHasCopied(didCopy);
    },
    [copyOptions]
  );

  useEffect(() => {
    let timeoutId: number | null = null;

    if (hasCopied) {
      timeoutId = window.setTimeout(() => {
        setHasCopied(false);
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [timeout, hasCopied]);

  return { onCopy, hasCopied };
}
