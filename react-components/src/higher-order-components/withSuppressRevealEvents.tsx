/*!
 * Copyright 2023 Cognite AS
 */

import {
  useRef,
  type ComponentType,
  useEffect,
  type ReactElement,
  type FunctionComponent
} from 'react';

export function withSuppressRevealEvents<T extends object>(
  Component: FunctionComponent<T>
): ComponentType<T> {
  return function SuppressRevealEvents(props: T): ReactElement {
    const divRef = useRef<HTMLDivElement>(null);

    const stopPropagation = (event: Event): void => {
      event.stopPropagation();
    };

    useEffect(() => {
      const div = divRef.current;

      if (div === null) {
        return;
      }

      div.addEventListener('pointerdown', stopPropagation);
      div.addEventListener('pointermove', stopPropagation);
      div.addEventListener('wheel', stopPropagation);
      div.addEventListener('keydown', stopPropagation);

      return () => {
        div.removeEventListener('pointerdown', stopPropagation);
        div.removeEventListener('pointermove', stopPropagation);
        div.removeEventListener('wheel', stopPropagation);
        div.removeEventListener('keydown', stopPropagation);
      };
    }, []);

    return (
      <div ref={divRef}>
        <Component {...props} />
      </div>
    );
  };
}
