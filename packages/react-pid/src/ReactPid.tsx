/* eslint-disable no-param-reassign */

import React, { useState } from 'react';
import {
  SvgDocument,
  newInternalSvgPath,
  SvgPath,
  DiagramSymbol,
  DiagramLineInstance,
  DiagramSymbolInstance,
  SvgRepresentation,
  getInternalSvgBoundingBox,
  SVG_ID,
  DiagramConnection,
  DiagramInstanceId,
  getDiagramInstanceId,
  isPathIdInInstance,
  connectionExists,
} from '@cognite/pid-tools';
import { ReactSVG } from 'react-svg';

import { ToolType, ExistingSymbolPromptData } from './types';
import { COLORS } from './constants';
import { ReactPidWrapper, ReactPidLayout } from './elements';
import { SidePanel } from './components';
import { Viewport } from './components/viewport/Viewport';
import { SaveSymbolModals } from './components/save-symbol-modals/SaveSymbolModals';

let svgDocument: SvgDocument | undefined;

const getSymbolInstanceByPathId = (
  symbolInstances: DiagramSymbolInstance[],
  pathId: string
): DiagramSymbolInstance | null => {
  const symbolInstance = symbolInstances.filter((symbolInstance) =>
    symbolInstance.pathIds.includes(pathId)
  );
  if (symbolInstance.length > 0) {
    return symbolInstance[0];
  }
  return null;
};

export const ReactPid: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [active, setActive] = useState<ToolType>('addSymbol');

  const [selection, setSelection] = useState<SVGElement[]>([]);
  const [lines, setLines] = useState<DiagramLineInstance[]>([]);
  const [symbols, setSymbols] = useState<DiagramSymbol[]>([]);
  const [symbolInstances, setSymbolInstances] = useState<
    DiagramSymbolInstance[]
  >([]);
  const [existingSymbolPromptData, setExistingSymbolPromptData] =
    useState<ExistingSymbolPromptData | null>(null);

  const [connections, setConnections] = React.useState<DiagramConnection[]>([]);
  const [connectionSelection, setConnectionSelection] =
    React.useState<DiagramInstanceId | null>(null);

  const setToolBarMode = (mode: ToolType) => {
    setSelection([]);
    setConnectionSelection(null);
    setActive(mode);
  };

  const loadSymbolsAsJson = (jsonData: any) => {
    if ('symbols' in jsonData) {
      const newSymbols = jsonData.symbols as DiagramSymbol[];
      setSymbols([...symbols, ...newSymbols]);

      if (svgDocument !== undefined) {
        if (!('symbolInstances' in jsonData)) {
          let allNewSymbolInstances: DiagramSymbolInstance[] = [];
          newSymbols.forEach((newSymbol) => {
            const newSymbolInstances = (
              svgDocument as SvgDocument
            ).findAllInstancesOfSymbol(newSymbol);
            allNewSymbolInstances = [
              ...allNewSymbolInstances,
              ...newSymbolInstances,
            ];
          });
          setSymbolInstances([...symbolInstances, ...allNewSymbolInstances]);
        }
      }
    }
    if ('lines' in jsonData) {
      const newLines = jsonData.lines as DiagramLineInstance[];
      setLines([...lines, ...newLines]);
    }
    if ('symbolInstances' in jsonData) {
      const newSymboleInstance =
        jsonData.symbolInstances as DiagramSymbolInstance[];
      setSymbolInstances([...symbolInstances, ...newSymboleInstance]);
    }
  };

  const getSymbolByName = (symbolName: string): DiagramSymbol | undefined => {
    return symbols.find((symbol) => symbol.symbolName === symbolName);
  };

  const shouldShowPrompt = (symbolName: string) => {
    const symbolExist = getSymbolByName(symbolName) !== undefined;
    return symbolExist && existingSymbolPromptData?.resolution !== 'add';
  };

  const setOrUpdateSymbol = (
    symbolName: string,
    svgRepresentation: SvgRepresentation
  ) => {
    let diagramSymbol = getSymbolByName(symbolName);
    if (diagramSymbol === undefined) {
      diagramSymbol = {
        symbolName,
        svgRepresentations: [svgRepresentation],
      } as DiagramSymbol;

      setSymbols([...symbols, diagramSymbol]);
    } else {
      diagramSymbol.svgRepresentations.push(svgRepresentation);
    }
    return diagramSymbol;
  };

  const createSvgRepresentation = (pathIds: string[]) => {
    const newSvgRepresentation = {} as SvgRepresentation;

    const internalSvgPaths = pathIds.map((pathId) =>
      svgDocument?.getInternalPathById(pathId)
    );

    newSvgRepresentation.boundingBox =
      getInternalSvgBoundingBox(internalSvgPaths);

    newSvgRepresentation.svgPaths = internalSvgPaths.map(
      (internalSvgPath) =>
        ({
          svgCommands: internalSvgPath?.serializeToPathCommands(),
        } as SvgPath)
    );
    return newSvgRepresentation;
  };

  const saveSymbol = (symbolName: string, selection: SVGElement[]) => {
    if (svgDocument === undefined) {
      return;
    }

    const showPrompt = shouldShowPrompt(symbolName);
    if (showPrompt) {
      setExistingSymbolPromptData({
        symbolName,
        svgElements: selection,
      });
      return;
    }

    const pathIds = selection.map((svgElement) => svgElement.id);
    const newSvgRepresentation = createSvgRepresentation(pathIds);
    const newSymbol = setOrUpdateSymbol(symbolName, newSvgRepresentation);

    setSelection([]);

    const newSymbolInstances = svgDocument.findAllInstancesOfSymbol(newSymbol);
    setSymbolInstances([...symbolInstances, ...newSymbolInstances]);
    setExistingSymbolPromptData(null);
  };

  const handleBeforeInjection = (svg?: SVGSVGElement) => {
    // console.log('handleBeforeInjection svg', svg);
    if (svg) {
      svg.id = SVG_ID;
      svg.style.width = '100%';
      svg.style.height = '100%';

      const recursive = (node: SVGElement) => {
        if (node.children.length === 0) {
          if (lines.some((line) => line.pathIds.includes(node.id))) {
            node.style.stroke = COLORS.diagramLine;
          }

          if (
            symbolInstances.some((symbolInst) =>
              symbolInst.pathIds.includes(node.id)
            )
          ) {
            node.style.stroke = COLORS.symbol;
          }

          if (isPathIdInInstance(node.id, connectionSelection)) {
            node.style.stroke = COLORS.connectionSelection;
          }

          if (selection.some((svgPath) => svgPath.id === node.id)) {
            node.style.stroke = COLORS.symbolSelection;
          }
        } else {
          for (let j = 0; j < node.children.length; j++) {
            const child = node.children[j] as SVGElement;
            recursive(child);
          }
        }
      };

      for (let j = 0; j < svg.children.length; j++) {
        const child = svg.children[j] as SVGElement;
        if (child.tagName === 'g') {
          recursive(child);
        }
      }
    }
  };

  const handleAfterInjection = (error: Error | null, svg?: SVGSVGElement) => {
    if (error) {
      return;
    }
    // console.log('handleAfterInjection', svg);

    if (svg) {
      const bBox = svg.getBBox();
      const all: SVGElement[] = [];

      svg.setAttribute(
        'viewBox',
        `${bBox.x} ${bBox.y} ${bBox.width} ${bBox.height}`
      );

      const recursive = (node: SVGElement) => {
        if (node.children.length === 0) {
          if (svgDocument === undefined) {
            all.push(node);
          }
          const originalStrokeWidth = node.style.strokeWidth;

          node.addEventListener('mouseenter', () => {
            const boldStrokeWidth = (
              1.5 * parseInt(originalStrokeWidth, 10)
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
          });

          node.addEventListener('mouseleave', () => {
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
          });

          node.addEventListener('click', () => {
            if (active === 'addSymbol') {
              if (selection.some((svgPath) => svgPath.id === node.id)) {
                const index = selection.map((e) => e.id).indexOf(node.id);
                setSelection([
                  ...selection.slice(0, index),
                  ...selection.slice(index + 1, selection.length),
                ]);
              } else {
                setSelection([...selection, node]);
              }
            } else if (active === 'addLine') {
              // Remove a line if already selected
              if (lines.some((line) => line.pathIds.includes(node.id))) {
                const index = lines.findIndex((line) =>
                  line.pathIds.includes(node.id)
                );
                const newLines = [...lines];
                newLines.splice(index, 1);
                setLines(newLines);
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
          });
        } else {
          for (let j = 0; j < node.children.length; j++) {
            const child = node.children[j] as SVGElement;
            recursive(child);
          }
        }
      };

      for (let j = 0; j < svg.children.length; j++) {
        const child = svg.children[j] as SVGElement;
        if (child.tagName === 'g') {
          recursive(child);
        }
      }

      if (svgDocument === undefined) {
        svgDocument = new SvgDocument(
          all
            .filter((svgElement) => svgElement.getAttribute('d'))
            .map((svgElement) => {
              return newInternalSvgPath(
                svgElement.getAttribute('d') as string,
                svgElement.id
              );
            })
        );
      }
    }
  };

  const handleFileChange = ({ target }: any) => {
    if (target && target.files.length > 0) {
      setFileUrl(URL.createObjectURL(target.files[0]));
      return;
    }
    setFileUrl('');
  };

  return (
    <ReactPidWrapper>
      <ReactPidLayout>
        <SidePanel
          active={active}
          symbols={symbols}
          lines={lines}
          symbolInstances={symbolInstances}
          selection={selection}
          setActive={setToolBarMode}
          loadSymbolsAsJson={loadSymbolsAsJson}
          saveSymbol={saveSymbol}
          connections={connections}
          fileUrl={fileUrl}
        />
        <Viewport>
          {fileUrl === '' && (
            <input
              type="file"
              accept=".svg"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              onChange={handleFileChange}
            />
          )}
          {fileUrl !== '' && (
            <ReactSVG
              style={{ touchAction: 'none' }}
              renumerateIRIElements={false}
              src={fileUrl}
              afterInjection={handleAfterInjection}
              beforeInjection={handleBeforeInjection}
            />
          )}
        </Viewport>
      </ReactPidLayout>
      {existingSymbolPromptData && (
        <SaveSymbolModals
          symbolName={existingSymbolPromptData.symbolName}
          onSymbolNameChange={(symbolName) =>
            setExistingSymbolPromptData({
              ...existingSymbolPromptData,
              symbolName,
            })
          }
          resolution={existingSymbolPromptData.resolution}
          onResolutionChange={(resolution) =>
            setExistingSymbolPromptData({
              ...existingSymbolPromptData,
              resolution,
            })
          }
          svgElements={existingSymbolPromptData.svgElements}
          onCancel={() => setExistingSymbolPromptData(null)}
          saveSymbol={saveSymbol}
        />
      )}
    </ReactPidWrapper>
  );
};
