import { useEffect, useRef } from 'react';
import { useRouter } from 'react-location';

import type { AppLocationGenerics } from 'routes';

export function useTitle(title?: string) {
  const previousTitleRef = useRef(document.title);
  const matches = useRouter<AppLocationGenerics>();
  const noop = () => undefined;
  const breadcrumbTitle = [
    title,
    ...matches.state.matches.flatMap(({ route: { meta } }) =>
      (meta?.title ?? noop)()
    ),
  ]
    .filter((title) => title)
    .join(' / ');

  document.title = `${
    breadcrumbTitle ? `${breadcrumbTitle} | ` : ''
  }Cognite Simulator Integration`;

  useEffect(() => {
    const previousTitle = previousTitleRef.current;
    return () => {
      document.title = previousTitle;
    };
  }, []);
}
