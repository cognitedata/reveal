import styled from 'styled-components';
import { DiagramSymbol, parseStyleString } from '@cognite/pid-tools';
import { Icon } from '@cognite/cogs.js';

const CollapseHeader = styled.div`
  display: grid;
  grid-template-columns: auto 2rem 2rem 1rem;
  align-items: center;
  width: 100%;
`;

interface CollapsableSymbolHeaderProps {
  symbol: DiagramSymbol;
  foundRotations: number;
  symbolInstanceCount: number;
  deleteSymbol: (symbol: DiagramSymbol) => void;
}

export const CollapsableSymbolHeader: React.FC<CollapsableSymbolHeaderProps> =
  ({ symbol, foundRotations, symbolInstanceCount, deleteSymbol }) => {
    const { boundingBox } = symbol.svgRepresentation;
    const strokeWidth = 1;
    const viewboxPadding = 2 * strokeWidth;

    return (
      <CollapseHeader>
        <span>{`${symbol.symbolType} - ${symbol.description} (${symbolInstanceCount})`}</span>
        <svg
          viewBox={`${boundingBox.x - viewboxPadding} ${
            boundingBox.y - viewboxPadding
          } ${boundingBox.width + viewboxPadding * 2} ${
            boundingBox.height + viewboxPadding * 2
          }`}
          style={{ aspectRatio: '1 / 1', height: '2rem' }}
        >
          {symbol.svgRepresentation.svgPaths.map((path) => {
            const fill =
              path.style === undefined
                ? 'none'
                : parseStyleString(path.style).fill ?? 'none';
            return (
              <path
                key={path.svgCommands}
                d={path.svgCommands}
                style={{
                  strokeWidth,
                  stroke: 'black',
                  fill,
                }}
              />
            );
          })}
        </svg>
        <span>{`(${foundRotations})`}</span>
        <Icon onClick={() => deleteSymbol(symbol)} type="Close" size={12} />
      </CollapseHeader>
    );
  };
