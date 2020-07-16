/* eslint-disable func-names */
/* eslint-disable no-console */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components/macro';

const ErrorOverlay = styled.div<{ zIndex: number }>`
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: ${({ zIndex }) => zIndex};
  pointer-events: none;
  opacity: 0.25;
  transition: 0.5s all;
`;

type Mode = '' | 'flash' | 'break' | 'fatal';

type Props = {
  errorMode: Mode;
  flashDurationMillis?: number;
  strict?: boolean;
  zIndex: number;
};

let intercepted = false;

const ErrorWatcher = ({
  errorMode,
  flashDurationMillis = 750,
  strict = false,
  zIndex,
}: Props) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();

  const clear = useCallback(() => {
    if (!overlayRef.current) {
      return;
    }
    overlayRef.current.setAttribute('style', 'background-color: transparent');
    setTimeoutId(undefined);
  }, [setTimeoutId]);

  const showError = useCallback(() => {
    if (!overlayRef.current) {
      return;
    }
    overlayRef.current.setAttribute('style', 'background-color: #f00');
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(clear, flashDurationMillis);
    setTimeoutId(id);
  }, [clear, flashDurationMillis, timeoutId]);

  const showWarning = useCallback(() => {
    if (!overlayRef.current) {
      return;
    }
    overlayRef.current.setAttribute('style', 'background-color: #ffe251');
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(clear, flashDurationMillis);
    setTimeoutId(id);
  }, [clear, flashDurationMillis, timeoutId]);

  useEffect(() => {
    if (!errorMode) {
      return;
    }
    if (intercepted) {
      return;
    }
    intercepted = true;

    (function () {
      const { error } = console;
      console.error = (...args: unknown[]) => {
        const joined = args.join(' ');
        if (strict) {
          if (joined.includes('Encountered two children with the same key')) {
            throw new Error(joined);
          }
        }

        switch (errorMode) {
          case 'break':
            // eslint-disable-next-line no-debugger
            debugger;
            break;
          case 'fatal': {
            console.error = error;
            throw new Error(joined);
          }
          case 'flash':
          default:
            showError();
            break;
        }
        error(...args);
      };
    })();
    (function () {
      const { warn } = console;
      console.warn = function (...args: unknown[]) {
        switch (errorMode) {
          case 'break':
            // eslint-disable-next-line no-debugger
            debugger;
            break;
          default:
            showWarning();
            break;
        }
        warn(...args);
      };
    })();
  }, [errorMode, showError, showWarning]);

  return <ErrorOverlay zIndex={zIndex} ref={overlayRef} />;
};

export default ErrorWatcher;
