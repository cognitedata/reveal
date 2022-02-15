import {
  connectionExists,
  DiagramConnection,
  DiagramInstanceId,
  DiagramLineInstance,
  DiagramSymbolInstance,
  getDiagramInstanceId,
  SVG_ID,
  getDiagramInstanceByPathId,
  getInstanceByDiagramInstanceId,
  createEquipmentTagInstance,
  DiagramEquipmentTagInstance,
  getDiagramEquipmentTagInstanceByTagId,
  PathReplacement,
  applyPathReplacementInSvg,
  PidDocumentWithDom,
  addOrRemoveLabelToInstance,
  addOrRemoveLineNumberToInstance,
  getDiagramEquipmentTagInstanceByLabelId,
  addOrRemoveLabelToEquipmentTag,
  isLine,
  getDiagramInstanceIdFromPathIds,
} from '@cognite/pid-tools';
import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { allSimplePaths } from 'graphology-simple-path';
import Graph from 'graphology';

import { deleteLineFromState } from '../../utils/symbolUtils';
import { COLORS } from '../../constants';
import { ToolType } from '../../types';
import { applyToLeafSVGElements } from '../../utils/svgDomUtils';

import {
  applyStyleToNode,
  colorSymbol,
  isDiagramLine,
  isInAddSymbolSelection,
  isSymbolInstance,
  setStrokeWidth,
  visualizeConnections,
  visualizeLabelsToSymbolInstances,
  visualizePidTspan,
} from './utils';

interface SvgViewerProps {
  fileUrl: string;
  active: ToolType;
  setActive: (tool: ToolType) => void;
  symbolInstances: DiagramSymbolInstance[];
  setSymbolInstances: (arg: DiagramSymbolInstance[]) => void;
  lines: DiagramLineInstance[];
  setLines: (arg: DiagramLineInstance[]) => void;
  selection: SVGElement[];
  setSelection: (arg: SVGElement[]) => void;
  splitSelection: string | null;
  setSplitSelection: (args: string | null) => void;
  pathReplacements: PathReplacement[];
  setPathReplacements: (args: PathReplacement[]) => void;
  connectionSelection: DiagramInstanceId | null;
  setConnectionSelection: (arg: DiagramInstanceId | null) => void;
  connections: DiagramConnection[];
  setConnections: (arg: DiagramConnection[]) => void;
  labelSelection: DiagramInstanceId | null;
  setLabelSelection: (arg: DiagramInstanceId | null) => void;
  setPidDocument: (arg: PidDocumentWithDom) => void;
  getPidDocument: () => PidDocumentWithDom | undefined;
  lineNumbers: string[];
  setLineNumbers: (lineNumber: string[]) => void;
  activeLineNumber: string | null;
  setActiveLineNumber: (lineNumber: string | null) => void;
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
  activeTagId: string | null;
  setActiveTagId: (arg: string | null) => void;
  inferLineNumbers: (
    symbolInstances: DiagramSymbolInstance[],
    lines: DiagramLineInstance[]
  ) => void;
  hideSelection: boolean;
}

export const SvgViewer: React.FC<SvgViewerProps> = ({
  fileUrl,
  active,
  setActive,
  symbolInstances,
  setSymbolInstances,
  lines,
  setLines,
  selection,
  setSelection,
  splitSelection,
  setSplitSelection,
  pathReplacements,
  setPathReplacements,
  connectionSelection,
  setConnectionSelection,
  connections,
  setConnections,
  setPidDocument,
  getPidDocument,
  labelSelection,
  setLabelSelection,
  lineNumbers,
  setLineNumbers,
  activeLineNumber,
  setActiveLineNumber,
  equipmentTags,
  setEquipmentTags,
  activeTagId,
  setActiveTagId,
  inferLineNumbers,
  hideSelection,
}) => {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphSelection, setGraphSelection] =
    useState<DiagramInstanceId | null>(null);
  const [graphPaths, setGraphPaths] = useState<DiagramInstanceId[][]>([]);

  /* eslint-disable no-param-reassign */
  const onMouseEnter = (
    e: MouseEvent,
    node: SVGElement,
    mainSvg: SVGSVGElement
  ) => {
    if (active === 'addSymbol' && !(node instanceof SVGTSpanElement)) {
      if (e.altKey) {
        setSelection(selection.filter((select) => select.id !== node.id));
      }
      if (e.shiftKey && !selection.some((select) => select.id === node.id)) {
        setSelection([...selection, node]);
      }
    }

    const boldStrokeWidth = (
      1.5 * parseInt(node.style.strokeWidth, 10)
    ).toString();
    if (active === 'connectInstances') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (symbolInstance === null) return;

      setStrokeWidth(symbolInstance, boldStrokeWidth, mainSvg);
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
          mainSvg,
          {
            filter: `hue-rotate(${(graphPathIndex + 1) * 100}deg)`,
          }
        );
      }
    } else if (active === 'connectLabels' || active === 'setLineNumber') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );

      if (symbolInstance === null) return;
      setStrokeWidth(symbolInstance, boldStrokeWidth, mainSvg);
    }
    if (active === 'addEquipmentTag') {
      if (node instanceof SVGTSpanElement) {
        node.style.fontWeight = '600';
      }
    } else {
      node.style.strokeWidth = boldStrokeWidth;
    }
  };
  /* eslint-enable no-param-reassign */

  /* eslint-disable no-param-reassign */
  const onMouseLeave = (
    node: SVGElement,
    originalStrokeWidth: string,
    mainSvg: SVGSVGElement
  ) => {
    if (active === 'connectInstances') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );
      if (symbolInstance === null) return;

      setStrokeWidth(symbolInstance, originalStrokeWidth, mainSvg);
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
          mainSvg,
          {
            filter: 'hue-rotate(0)',
          }
        );
      }
    } else if (active === 'connectLabels' || active === 'setLineNumber') {
      const symbolInstance = getDiagramInstanceByPathId(
        [...symbolInstances, ...lines],
        node.id
      );

      if (symbolInstance === null) return;
      setStrokeWidth(symbolInstance, originalStrokeWidth, mainSvg);
    }
    node.style.fontWeight = '';
    node.style.strokeWidth = originalStrokeWidth;
  };
  /* eslint-enable no-param-reassign */

  const onMouseClick = (node: SVGElement) => {
    const pidDocument = getPidDocument();
    if (pidDocument === undefined) return;

    if (active !== 'connectLabels') {
      if (node instanceof SVGTSpanElement) {
        const regexMatch = node.innerHTML.match(/L[0-9]{3}/);
        if (regexMatch) {
          const [lineNumber] = regexMatch;
          if (!lineNumbers.includes(lineNumber)) {
            setLineNumbers([...lineNumbers, lineNumber]);
          }
          setActiveLineNumber(lineNumber);
          setActive('setLineNumber');
        }
        return;
      }
    }

    if (active === 'addSymbol') {
      if (!(node instanceof SVGTSpanElement)) {
        const alreadySelected = isInAddSymbolSelection(node, selection);
        if (alreadySelected) {
          setSelection(selection.filter((e) => e.id !== node.id));
        } else {
          setSelection([...selection, node]);
        }
      }
    } else if (active === 'addLine') {
      if (isDiagramLine(node, lines)) {
        const line = getDiagramInstanceByPathId(lines, node.id);
        if (!line) {
          return;
        }
        deleteLineFromState(
          line as DiagramLineInstance,
          lines,
          connections,
          setConnections,
          setLines
        );
      } else if (!(node instanceof SVGTSpanElement)) {
        setLines([
          ...lines,
          {
            type: 'Line',
            pathIds: [node.id],
            id: getDiagramInstanceIdFromPathIds([node.id]),
            labelIds: [],
            lineNumbers: [],
            inferedLineNumbers: [],
          } as DiagramLineInstance,
        ]);
      }
    } else if (active === 'splitLine') {
      if (node instanceof SVGTSpanElement) return;
      if (isSymbolInstance(node, symbolInstances)) return;

      // Remove line if it was already selected
      if (splitSelection === node.id) {
        setSplitSelection(null);
        return;
      }
      if (splitSelection !== null) {
        const tJunctionPathReplacements = pidDocument
          .getPidPathById(splitSelection)
          ?.getTJunctionByIntersectionWith(
            pidDocument.getPidPathById(node.id)!
          );

        if (!tJunctionPathReplacements) {
          return;
        }
        const oldLineIds = [node.id, splitSelection];
        setLines(lines.filter((line) => !oldLineIds.includes(line.pathIds[0])));

        setConnections(
          connections.filter(
            (connection) =>
              !(
                oldLineIds.includes(connection.end) ||
                oldLineIds.includes(connection.start)
              )
          )
        );

        setPathReplacements([
          ...pathReplacements,
          ...tJunctionPathReplacements,
        ]);
        setSplitSelection(null);
        return;
      }
      setSplitSelection(node.id);
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
        const diagramInstanceId = diagramInstance
          ? getDiagramInstanceId(diagramInstance)
          : node.id;

        if (diagramInstanceId === labelSelection) {
          setLabelSelection(null);
          return;
        }
        if (diagramInstance) {
          setLabelSelection(diagramInstanceId);
        }
      } else {
        // add or remove labels to symbol/line instance given `labelSelection`
        if (!labelSelection) {
          return;
        }
        const diagramInstance = getInstanceByDiagramInstanceId(
          [...symbolInstances, ...lines],
          labelSelection
        );
        if (!diagramInstance) {
          return;
        }
        if (isLine(diagramInstance)) {
          addOrRemoveLabelToInstance(node.id, node.innerHTML, diagramInstance);
          setLines([...lines]);
        } else {
          addOrRemoveLabelToInstance(node.id, node.innerHTML, diagramInstance);
          setSymbolInstances([...symbolInstances]);
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
    } else if (active === 'setLineNumber') {
      if (activeLineNumber === null) return;

      const instances = [...symbolInstances, ...lines];
      const diagramInstance = getDiagramInstanceByPathId(instances, node.id);
      if (diagramInstance === null) return;

      if (isLine(diagramInstance)) {
        addOrRemoveLineNumberToInstance(activeLineNumber, diagramInstance);
      } else {
        addOrRemoveLineNumberToInstance(activeLineNumber, diagramInstance);
      }

      // `diagramInstance` is indirectly set to state with this function
      inferLineNumbers(symbolInstances, lines);
    } else if (
      active === 'addEquipmentTag' &&
      node instanceof SVGTSpanElement
    ) {
      if (activeTagId) {
        const tag = getDiagramEquipmentTagInstanceByTagId(
          activeTagId,
          equipmentTags
        );
        if (tag === undefined) return;
        addOrRemoveLabelToEquipmentTag(node, tag);
        if (tag.labelIds.length < 1) {
          setActiveTagId(null);
          setEquipmentTags(
            equipmentTags.filter((tag) => tag.labelIds.length > 0)
          );
        } else {
          setActiveTagId(tag.id);
          setEquipmentTags([...equipmentTags]);
        }
      } else {
        const tag = getDiagramEquipmentTagInstanceByLabelId(
          node.id,
          equipmentTags
        );
        if (tag === undefined) {
          const newTag = createEquipmentTagInstance(node);
          setEquipmentTags([...equipmentTags, newTag]);
          setActiveTagId(newTag.id);
        } else {
          setActiveTagId(tag.id);
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

    pathReplacements.forEach((pathReplacement) => {
      applyPathReplacementInSvg(svg as SVGSVGElement, pathReplacement);
    });

    const allSVGElements: SVGElement[] = [];
    applyToLeafSVGElements(svg, (node) => {
      allSVGElements.push(node);

      applyStyleToNode({
        node,
        selection,
        connectionSelection,
        labelSelection,
        splitSelection,
        symbolInstances,
        lines,
        connections,
        graphPaths,
        graphSelection,
        active,
        activeLineNumber,
        equipmentTags,
        activeTagId,
        hideSelection,
      });

      node.addEventListener('mouseenter', (e) => onMouseEnter(e, node, svg));

      const originalStrokeWidth = node.style.strokeWidth;
      node.addEventListener('mouseleave', () => {
        onMouseLeave(node, originalStrokeWidth, svg);
      });

      node.addEventListener('click', () => {
        onMouseClick(node);
      });
    });

    const pidDocument = PidDocumentWithDom.fromSVG(svg, allSVGElements);
    setPidDocument(pidDocument);

    if (active === 'connectInstances') {
      visualizeConnections(
        svg,
        pidDocument,
        connections,
        symbolInstances,
        lines
      );
    }

    if (active === 'connectLabels') {
      visualizeLabelsToSymbolInstances(svg, pidDocument, symbolInstances);
    } else {
      pidDocument.pidLabels
        .filter((pidLabel) => {
          return pidLabel.text.match(/L[0-9]{3}/);
        })
        .forEach((pidTspan) => {
          visualizePidTspan(
            svg,
            pidTspan,
            'blue',
            pidTspan.text === activeLineNumber ? 0.4 : 0.2
          );
        });
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
    setActiveTagId(null);
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
