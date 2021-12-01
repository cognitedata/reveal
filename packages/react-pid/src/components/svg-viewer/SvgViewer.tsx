import {
  connectionExists,
  DiagramConnection,
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  getDiagramInstanceId,
  SvgDocument,
  SVG_ID,
  newSvgDocumentFromSVGElements,
  getSymbolInstanceByPathId,
} from '@cognite/pid-tools';
import { ReactSVG } from 'react-svg';

import { ToolType } from '../../types';
import { applyToLeafSVGElements } from '../../utils/svgDomUtils';

import {
  applyStyleToNode,
  isDiagramLine,
  isInAddSymbolSelection,
} from './utils';

interface SvgViewerProps {
  fileUrl: string;
  active: ToolType;
  symbolInstances: DiagramSymbolInstance[];
  lines: DiagramLineInstance[];
  setLines: (arg: DiagramLineInstance[]) => void;
  selection: SVGElement[];
  setSelection: (arg: SVGElement[]) => void;
  connectionSelection: DiagramInstanceId | null;
  setConnectionSelection: (arg: DiagramInstanceId | null) => void;
  connections: DiagramConnection[];
  setConnections: (arg: DiagramConnection[]) => void;
  svgDocument: SvgDocument | undefined;
  setSvgDocument: (arg: SvgDocument) => void;
}

export const SvgViewer: React.FC<SvgViewerProps> = ({
  fileUrl,
  active,
  symbolInstances,
  lines,
  setLines,
  selection,
  setSelection,
  connectionSelection,
  setConnectionSelection,
  connections,
  setConnections,
  svgDocument,
  setSvgDocument,
}) => {
  /* eslint-disable no-param-reassign */
  const onMouseEnter = (node: SVGElement) => {
    const boldStrokeWidth = (
      1.5 * parseInt(node.style.strokeWidth, 10)
    ).toString();
    if (active === 'connectInstances') {
      const symbolInstance = getSymbolInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (symbolInstance) {
        symbolInstance.pathIds.forEach((pathId) => {
          (
            document.getElementById(pathId) as unknown as SVGElement
          ).style.strokeWidth = boldStrokeWidth;
        });
      }
    } else {
      node.style.strokeWidth = boldStrokeWidth;
    }
  };
  /* eslint-enable no-param-reassign */

  /* eslint-disable no-param-reassign */
  const onMouseLeave = (node: SVGElement, originalStrokeWidth: string) => {
    if (active === 'connectInstances') {
      const symbolInstance = getSymbolInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (symbolInstance) {
        symbolInstance.pathIds.forEach((pathId) => {
          (
            document.getElementById(pathId) as unknown as SVGElement
          ).style.strokeWidth = originalStrokeWidth;
        });
      }
    } else {
      node.style.strokeWidth = originalStrokeWidth;
    }
  };
  /* eslint-enable no-param-reassign */

  const onMouseClick = (node: SVGElement) => {
    if (active === 'addSymbol') {
      if (isInAddSymbolSelection(node, selection)) {
        setSelection(selection.filter((e) => e.id !== node.id));
      } else {
        setSelection([...selection, node]);
      }
    } else if (active === 'addLine') {
      if (isDiagramLine(node, lines)) {
        setLines(lines.filter((line) => !line.pathIds.includes(node.id)));
      } else {
        setLines([
          ...lines,
          {
            symbolName: 'Line',
            pathIds: [node.id],
          } as DiagramLineInstance,
        ]);
      }
    } else if (active === 'connectInstances') {
      const symbolInstance = getSymbolInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (symbolInstance) {
        const instanceId = getDiagramInstanceId(symbolInstance);
        if (connectionSelection === null) {
          setConnectionSelection(instanceId);
        } else if (instanceId === connectionSelection) {
          setConnectionSelection(null);
        } else {
          const newConnection = {
            start: connectionSelection,
            end: instanceId,
            direction: 'unknown',
          } as DiagramConnection;
          if (connectionExists(connections, newConnection)) {
            return;
          }
          setConnections([...connections, newConnection]);
          setConnectionSelection(instanceId);
        }
      }
    }
  };

  /* eslint-disable no-param-reassign */
  const handleAfterInjection = (error: Error | null, svg?: SVGSVGElement) => {
    if (error !== null || svg === undefined) return;

    svg.id = SVG_ID;
    svg.style.width = '100%';
    svg.style.height = '100%';
    const bBox = svg.getBBox();
    svg.setAttribute(
      'viewBox',
      `${bBox.x} ${bBox.y} ${bBox.width} ${bBox.height}`
    );

    const allSVGElements: SVGElement[] = [];
    applyToLeafSVGElements(svg, (node) => {
      if (svgDocument === undefined) {
        allSVGElements.push(node);
      }

      applyStyleToNode(
        node,
        selection,
        connectionSelection,
        symbolInstances,
        lines
      );

      node.addEventListener('mouseenter', () => onMouseEnter(node));

      const originalStrokeWidth = node.style.strokeWidth;
      node.addEventListener('mouseleave', () => {
        onMouseLeave(node, originalStrokeWidth);
      });

      node.addEventListener('click', () => {
        onMouseClick(node);
      });
    });

    if (svgDocument === undefined) {
      setSvgDocument(newSvgDocumentFromSVGElements(allSVGElements));
    }
  };
  /* eslint-enable no-param-reassign */

  return (
    <ReactSVG
      style={{ touchAction: 'none' }}
      renumerateIRIElements={false}
      src={fileUrl}
      afterInjection={handleAfterInjection}
    />
  );
};
