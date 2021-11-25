import styled from 'styled-components';
import { DiagramSymbol } from '@cognite/pid-tools';

const CollapseHeader = styled.div`
  display: grid;
  grid-template-columns: auto 3rem max-content;
  align-items: center;
  width: 100%;
`;

interface CollapsableSymbolHeaderProps {
  symbol: DiagramSymbol;
  symbolInstanceCount: number;
}

export const CollapsableSymbolHeader: React.FC<CollapsableSymbolHeaderProps> =
  ({ symbol, symbolInstanceCount }) => {
    const { boundingBox } = symbol.svgRepresentations[0];
    const strokeWidth = 1;
    const viewboxPadding = 2 * strokeWidth;

    return (
      <CollapseHeader>
        <span>{`${symbol.symbolName} (${symbolInstanceCount})`}</span>
        <svg
          viewBox={`${boundingBox.x - viewboxPadding} ${
            boundingBox.y - viewboxPadding
          } ${boundingBox.width + viewboxPadding * 2} ${
            boundingBox.height + viewboxPadding * 2
          }`}
          style={{ aspectRatio: '1 / 1', height: '2rem' }}
        >
          {symbol.svgRepresentations[0].svgPaths.map((path) => {
            return (
              <path
                key={path.svgCommands}
                d={path.svgCommands}
                style={{
                  strokeWidth,
                  stroke: 'black',
                  fill: 'none',
                }}
              />
            );
          })}
        </svg>
        <span>({symbol.svgRepresentations.length})</span>
      </CollapseHeader>
    );
  };
