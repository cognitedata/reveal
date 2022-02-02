import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectExplorerAllFiles } from 'src/modules/Explorer/store/selectors';
import { RootState } from 'src/store/rootReducer';

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
