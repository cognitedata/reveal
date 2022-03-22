import {
  CognitePid,
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
      try {
        const loadedSymbols = ParserStorage.symbols.load(documentType);
        pidRef?.loadLegend({ symbols: loadedSymbols });
        setHasLegendBeenLoaded(true);
      } catch (error) {
        // If we can't parse the current symbol format - reset it
        ParserStorage.symbols.save(documentType, []);
        // eslint-disable-next-line no-console
        console.log(`Resetting local storage symbols due to error: ${error}`);
      }
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
