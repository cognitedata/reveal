import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../store/rootReducer';
import { selectExplorerAllFiles } from '../../Explorer/store/selectors';

export const DirectoryPrefixesProvider = ({
  children,
}: {
  children: (availablePrefixes: string[]) => React.ReactNode;
}) => {
  const [availablePrefixes, setAvailablePrefixes] = useState<string[]>([]);

  const exploreFiles = useSelector((state: RootState) =>
    selectExplorerAllFiles(state.explorerReducer)
  );

  useEffect(() => {
    const prefixes = exploreFiles
      .map((file) => (file as any).directory)
      .filter((v, i, a) => a.indexOf(v) === i && v !== undefined);
    setAvailablePrefixes(prefixes);
  }, [exploreFiles]);

  return <>{children(availablePrefixes)}</>;
};
