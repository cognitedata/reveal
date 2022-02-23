import { useEffect, useState } from 'react';
import {
  computeSymbolInstances,
  DiagramSymbol,
  DiagramSymbolInstance,
  DocumentType,
  PidDocumentWithDom,
} from '@cognite/pid-tools';

import usePrevious from '../../utils/usePrevious';

import ParserStorage from './ParserStorage';

const shouldLoadFromStorage = (
  previousDocumentType: DocumentType,
  documentType: DocumentType
) => {
  return documentType !== DocumentType.unknown;
};

const shouldSaveToStorage = (
  previousDocumentType: DocumentType,
  documentType: DocumentType
) => {
  // Skip saving if document type just changed, otherwise we would immediately
  // overwrite save empty symbols.
  const didDocumentTypeChangeOnLastRender =
    previousDocumentType !== documentType;

  return (
    documentType !== DocumentType.unknown && !didDocumentTypeChangeOnLastRender
  );
};

const useSymbolState = (
  documentType: DocumentType,
  pidDocument: PidDocumentWithDom | undefined
) => {
  const previousDocumentType = usePrevious<DocumentType>(
    documentType ?? DocumentType.unknown
  );

  const [symbolInstances, setSymbolInstances] = useState<
    DiagramSymbolInstance[]
  >([]);
  const [symbols, setSymbols] = useState<DiagramSymbol[]>(
    ParserStorage.symbols.load(documentType)
  );

  useEffect(() => {
    if (shouldLoadFromStorage(previousDocumentType, documentType)) {
      setSymbols(ParserStorage.symbols.load(documentType));
    }
  }, [documentType, previousDocumentType]);

  useEffect(() => {
    if (shouldSaveToStorage(previousDocumentType, documentType)) {
      ParserStorage.symbols.save(documentType, symbols);
    }
  }, [documentType, symbols, previousDocumentType]);

  useEffect(() => {
    if (pidDocument !== undefined) {
      setSymbolInstances(computeSymbolInstances(symbols, pidDocument));
    }
  }, [symbols, pidDocument]);

  return {
    symbols,
    setSymbols,
    symbolInstances,
    setSymbolInstances,
  };
};

export default useSymbolState;
