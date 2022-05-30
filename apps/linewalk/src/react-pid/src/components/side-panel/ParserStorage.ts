import { DiagramSymbol, DiagramType } from '@cognite/pid-tools';

const LEGEND_LOCALSTORAGE_KEY_PREFIX = 'PID_TOOL_';

const getLegendKeyByDiagramType = (diagramType: DiagramType) => {
  return `${LEGEND_LOCALSTORAGE_KEY_PREFIX}${diagramType}`;
};

const ParserStorage = {
  symbols: {
    load: (diagramType: DiagramType): DiagramSymbol[] => {
      try {
        const key = getLegendKeyByDiagramType(diagramType);
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
    save: (diagramType: DiagramType, symbols: DiagramSymbol[]): void =>
      window.localStorage.setItem(
        getLegendKeyByDiagramType(diagramType),
        JSON.stringify({
          symbols,
        })
      ),
  },
};

export default ParserStorage;
