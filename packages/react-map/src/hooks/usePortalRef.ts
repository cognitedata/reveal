import * as React from 'react';

export const usePortalRef = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isRefReady, setIsRefReady] = React.useState(false);
  React.useLayoutEffect(() => {
    // Force a rerender, so it can be passed to the child.
    setIsRefReady(Boolean(ref));
  }, []);

  return { ref, isRefReady };
};
