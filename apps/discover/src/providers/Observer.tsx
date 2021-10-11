import * as React from 'react';

export const Observer: React.FC = ({ children }) => {
  // React.useEffect(() => {
  //   const test = setTimeout(() => {
  //     mutate({
  //       filters: {
  //         documents: { facets: filterState.appliedFilters.documents },
  //       },
  //     });
  //   }, 50);
  //   return () => clearTimeout(test);
  // }, [filterState.appliedFilters.documents]);

  return <>{children}</>;
};
