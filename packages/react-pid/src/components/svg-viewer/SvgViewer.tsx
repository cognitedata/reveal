import {
  connectionExists,
  DiagramConnection,
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  getDiagramInstanceId,
  SvgDocument,
  SVG_ID,
  getDiagramInstanceByPathId,
} from '@cognite/pid-tools';
import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { allSimplePaths } from 'graphology-simple-path';
import Graph from 'graphology';

import { COLORS } from '../../constants';
import { ToolType } from '../../types';
import { applyToLeafSVGElements } from '../../utils/svgDomUtils';

import {
  addOrRemoveLabelToInstance,
  applyStyleToNode,
  colorSymbol,
  isDiagramLine,
  isInAddSymbolSelection,
} from './utils';

interface SvgViewerProps {
  fileUrl: string;
  active: ToolType;
  symbolInstances: DiagramSymbolInstance[];
  setSymbolInstances: (arg: DiagramSymbolInstance[]) => void;
  lines: DiagramLineInstance[];
  setLines: (arg: DiagramLineInstance[]) => void;
  selection: SVGElement[];
  setSelection: (arg: SVGElement[]) => void;
  connectionSelection: DiagramInstanceId | null;
  setConnectionSelection: (arg: DiagramInstanceId | null) => void;
  connections: DiagramConnection[];
  setConnections: (arg: DiagramConnection[]) => void;
  labelSelection: DiagramInstanceId | null;
  setLabelSelection: (arg: DiagramInstanceId | null) => void;
  svgDocument: SvgDocument | undefined;
  setSvgDocument: (arg: SvgDocument) => void;
}

export const SvgViewer: React.FC<SvgViewerProps> = ({
  fileUrl,
  active,
  symbolInstances,
  setSymbolInstances,
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
  labelSelection,
  setLabelSelection,
}) => {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphSelection, setGraphSelection] =
    useState<DiagramInstanceId | null>(null);
  const [graphPaths, setGraphPaths] = useState<DiagramInstanceId[][]>([]);

  /* eslint-disable no-param-reassign */
  const onMouseEnter = (node: SVGElement) => {
    const boldStrokeWidth = (
      1.5 * parseInt(node.style.strokeWidth, 10)
    ).toString();
    if (active === 'connectInstances') {
      const symbolInstance = getDiagramInstanceByPathId(
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
    } else if (active === 'graphExplorer') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );

      if (symbolInstance === null) return;

      const diagramId = getDiagramInstanceId(symbolInstance);
      if (diagramId === null) return;
      const graphPathIndex = graphPaths.findIndex((pathElem) =>
        pathElem.includes(diagramId)
      );
      const graphPath = graphPaths[graphPathIndex];

      if (!graphPath) return;

      const pathToDraw = graphPath;
      for (let i = 0; i < pathToDraw.length; i++) {
        const diagramInstanceId = pathToDraw[i];
        colorSymbol(
          diagramInstanceId,
          COLORS.graphPath,
          [...symbolInstances, ...lines],
          {
            filter: `hue-rotate(${(graphPathIndex + 1) * 100}deg)`,
          }
        );
      }
      // color the whole line
    }

    node.style.strokeWidth = boldStrokeWidth;
  };
  /* eslint-enable no-param-reassign */

  /* eslint-disable no-param-reassign */
  const onMouseLeave = (node: SVGElement, originalStrokeWidth: string) => {
    if (active === 'connectInstances') {
      const symbolInstance = getDiagramInstanceByPathId(
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
    } else if (active === 'graphExplorer') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );

      if (symbolInstance === null) return;

      const diagramId = getDiagramInstanceId(symbolInstance);
      if (diagramId === null) return;
      const graphPath = graphPaths.filter((pathElem) =>
        pathElem.includes(diagramId)
      );

      if (graphPath.length === 0) return;

      const pathToDraw = graphPath[0];
      for (let i = 0; i < pathToDraw.length; i++) {
        const diagramInstanceId = pathToDraw[i];
        colorSymbol(
          diagramInstanceId,
          COLORS.graphPath,
          [...symbolInstances, ...lines],
          {
            filter: 'hue-rotate(0)',
          }
        );
      }
    }
    node.style.strokeWidth = originalStrokeWidth;
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
            labels: [],
          } as DiagramLineInstance,
        ]);
      }
    } else if (active === 'connectInstances') {
      const symbolInstance = getDiagramInstanceByPathId(
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
    } else if (active === 'connectLabels') {
      // selection or deselect symbol/line instance that will be used for adding labels
      if (!(node instanceof SVGTSpanElement)) {
        const diagramInstance = getDiagramInstanceByPathId(
          [...symbolInstances, ...lines],
          node.id
        );
        if (node.id === labelSelection) {
          setLabelSelection(null);
          return;
        }
        if (diagramInstance) {
          setLabelSelection(getDiagramInstanceId(diagramInstance));
        }
      } else {
        // add or remove labels to symbol/line instance given `labelSelection`
        if (!labelSelection) {
          return;
        }
        const pidLabel = svgDocument?.getPidTspanById(node.id);
        if (!pidLabel) {
          return;
        }
        const symbolInstance = getDiagramInstanceByPathId(
          [...symbolInstances, ...lines],
          labelSelection
        );
        if (!symbolInstance) {
          return;
        }
        if (symbolInstance.symbolName === 'Line') {
          addOrRemoveLabelToInstance(
            node,
            pidLabel,
            symbolInstance,
            lines,
            (arg) => {
              setLines(arg as DiagramLineInstance[]);
            }
          );
        } else {
          addOrRemoveLabelToInstance(
            node,
            pidLabel,
            symbolInstance,
            symbolInstances,
            setSymbolInstances
          );
        }
      }
    } else if (active === 'graphExplorer') {
      if (graph === null) return;

      const symbolInstance = getDiagramInstanceByPathId(
        symbolInstances,
        node.id
      );
      if (symbolInstance) {
        const instanceId = getDiagramInstanceId(symbolInstance);
        if (!graph.hasNode(instanceId)) return;

        if (graphSelection === null) {
          setGraphSelection(instanceId);
          setGraphPaths([]);
          return;
        }

        if (instanceId === graphSelection) {
          setGraphSelection(null);
          return;
        }

        const paths = allSimplePaths(graph, graphSelection, instanceId);
        setGraphPaths(paths);
        setGraphSelection(null);
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
        labelSelection,
        symbolInstances,
        lines,
        graphPaths,
        graphSelection
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
      setSvgDocument(SvgDocument.fromSVGElements(allSVGElements));
    }
  };
  /* eslint-enable no-param-reassign */

  useEffect(() => {
    if (active !== 'graphExplorer') {
      return;
    }

    const graphInstance = new Graph();
    for (let i = 0; i < connections.length; i++) {
      graphInstance.mergeEdge(connections[i].start, connections[i].end);
      graphInstance.mergeEdge(connections[i].end, connections[i].start);
    }
    setGraph(graphInstance);
  }, [active]);

  return (
    <ReactSVG
      style={{ touchAction: 'none' }}
      renumerateIRIElements={false}
      src={fileUrl}
      afterInjection={handleAfterInjection}
    />
  );
};
