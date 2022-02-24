import {
  CognitePid,
  computeSymbolInstances,
  DiagramSymbol,
  DiagramSymbolInstance,
  DocumentType,
} from '@cognite/pid-tools';
import { useEffect, useState } from 'react';

import ParserStorage from './ParserStorage';

const useSymbolState = (
  pidRef: CognitePid | undefined,
  documentType: DocumentType,
  hasDocumentLoaded: boolean
) => {
  const [hasLegendBeenLoaded, setHasLegendBeenLoaded] = useState(false);

  const [symbolInstances, setSymbolInstances] = useState<
    DiagramSymbolInstance[]
  >([]);

  const [symbols, setSymbols] = useState<DiagramSymbol[]>([]);

  useEffect(() => {
    const pidDocument = pidRef?.pidDocument;
    const shouldLoadFromStorage =
      hasDocumentLoaded && pidDocument !== undefined;
    if (shouldLoadFromStorage) {
      const loadedSymbols = ParserStorage.symbols.load(documentType);
      pidRef?.setSymbols(loadedSymbols);
      pidRef?.setSymbolInstances(
        computeSymbolInstances(loadedSymbols, pidDocument)
      );
      setHasLegendBeenLoaded(true);
    }
  }, [hasDocumentLoaded]);

  useEffect(() => {
    if (hasDocumentLoaded && hasLegendBeenLoaded) {
      ParserStorage.symbols.save(documentType, symbols);
    }
  }, [documentType, symbols, hasDocumentLoaded, hasLegendBeenLoaded]);

  return {
    symbols,
    setSymbols,
    symbolInstances,
    setSymbolInstances,
  };
};

export default useSymbolState;
