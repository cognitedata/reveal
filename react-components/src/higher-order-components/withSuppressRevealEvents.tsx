/*!
 * Copyright 2023 Cognite AS
 */

import { useRef, type ComponentType, type JSX, useEffect, type ReactElement } from 'react';

export function withSuppressRevealEvents<T extends JSX.IntrinsicAttributes>(
  Component: ComponentType<T>
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

      return () => {
        div.removeEventListener('pointerdown', stopPropagation);
        div.removeEventListener('pointermove', stopPropagation);
        div.removeEventListener('wheel', stopPropagation);
      };
    }, []);

    return (
      <div ref={divRef}>
        <Component {...props} />
      </div>
    );
  };
}
