import { DiagramSymbol, DocumentType } from '@cognite/pid-tools';

const LEGEND_LOCALSTORAGE_KEY_PREFIX = 'PID_TOOL_';

const getLegendKeyByDocumentType = (documentType: DocumentType) => {
  return `${LEGEND_LOCALSTORAGE_KEY_PREFIX}${documentType}`;
};

const ParserStorage = {
  symbols: {
    load: (documentType: DocumentType): DiagramSymbol[] => {
      try {
        const key = getLegendKeyByDocumentType(documentType);
        const json = window.localStorage.getItem(key);

        if (!json) {
          // eslint-disable-next-line no-console
          console.debug(`${key} did not exist in localStorage`);
          return [];
        }

        const { symbols }: { symbols: DiagramSymbol[] } = JSON.parse(json);

        if (!symbols) {
          // eslint-disable-next-line no-console
          console.warn('Symbols did not exist in localStorage');
          return [];
        }

        if (!Array.isArray(symbols)) {
          throw new Error('Symbols had unexpected type');
        }

        return symbols;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Could not load legend from localStorage ${error}`);
        return [];
      }
    },
    save: (documentType: DocumentType, symbols: DiagramSymbol[]): void =>
      window.localStorage.setItem(
        getLegendKeyByDocumentType(documentType),
        JSON.stringify({
          symbols,
        })
      ),
  },
};

export default ParserStorage;
