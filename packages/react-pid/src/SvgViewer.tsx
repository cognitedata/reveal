/* eslint-disable no-param-reassign */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import constant from 'lodash/constant';
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
} from '@cognite/pid-tools';
import { Modal, Input, Button, ToolBar, ToolBarButton } from '@cognite/cogs.js';
import { ToolType } from 'types';

import {
  ModalFooterWrapper,
  ReactSVGWindow,
  ReactSVGWrapper,
  SvgViewerWrapper,
  ZoomButtonsWrapper,
} from './elements';
import { keyboardNavigation } from './utils/keyboardNavigation';
import { SidePanel } from './components';

const appElement = document.querySelector('#root') || undefined;

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

type ExistingSymbolPromptData = {
  symbolName: string;
  SVGElements: SVGElement[];
  resolution?: 'add' | 'rename';
} | null;

const {
  initNavigationEvents,
  removeNavigationEvents,
  zoomIn,
  zoomOut,
  resetZoom,
} = keyboardNavigation();

export const SvgViewer = () => {
  const [fileUrl, setFileUrl] = React.useState('');
  const [active, setActive] = React.useState<ToolType>('addSymbol');

  const [selection, setSelection] = React.useState<SVGElement[]>([]);
  const [lines, setLines] = React.useState<DiagramLineInstance[]>([]);
  const [symbols, setSymbols] = React.useState<DiagramSymbol[]>([]);
  const [symbolInstances, setSymbolInstances] = React.useState<
    DiagramSymbolInstance[]
  >([]);
  const [existingSymbolPromptData, setExistingSymbolPromptData] =
    useState<ExistingSymbolPromptData>(null);

  useEffect(() => {
    if (existingSymbolPromptData?.resolution === 'add') {
      saveSymbol(
        existingSymbolPromptData.symbolName,
        existingSymbolPromptData.SVGElements
      );
    }
  }, [existingSymbolPromptData]);

  const viewportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (viewportRef.current) {
      initNavigationEvents(viewportRef.current as unknown as HTMLDivElement);
      return () => removeNavigationEvents();
    }
    return constant(true);
  });

  const zoomButtonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'ZoomIn',
        onClick: () => zoomIn(),
        description: 'Zoom in',
      },
      {
        icon: 'Refresh',
        onClick: () => resetZoom(),
        description: 'Reset zoom',
      },
      {
        icon: 'ZoomOut',
        onClick: () => zoomOut(),
        description: 'Zoom out',
      },
    ],
  ];

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
        SVGElements: selection,
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

  // const saveLine = (selection: SVGElement[]) => {};

  const handleBeforeInjection = (svg?: SVGSVGElement) => {
    // console.log('handleBeforeInjection svg', svg);
    if (svg) {
      svg.id = SVG_ID;
      svg.style.width = '100%';
      svg.style.height = '100%';

      const recursive = (node: SVGElement) => {
        if (node.children.length === 0) {
          if (selection.some((svgPath) => svgPath.id === node.id)) {
            node.style.stroke = 'red';
            const val = 1.5 * parseInt(node.style.strokeWidth, 10);
            node.style.strokeWidth = val.toString();
          }

          if (lines.some((line) => line.pathIds.includes(node.id))) {
            node.style.stroke = 'magenta';
          }

          if (
            symbolInstances.some((symbolInst) =>
              symbolInst.pathIds.includes(node.id)
            )
          ) {
            node.style.stroke = 'pink';
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
          const originalStroke = node.style.stroke;
          node.addEventListener('mouseenter', () => {
            if (active === 'connectInstances') {
              const symbolInstance = getSymbolInstanceByPathId(
                symbolInstances,
                node.id
              );
              if (symbolInstance) {
                symbolInstance.pathIds.forEach((pathId) => {
                  (
                    document.getElementById(pathId) as unknown as SVGElement
                  ).style.stroke = 'yellow';
                });
                return;
              }
            }
            if (selection.some((svgPath) => svgPath.id === node.id)) {
              const val = 1.5 * parseInt(originalStrokeWidth, 10);
              node.style.strokeWidth = val.toString();
            } else {
              const val = 1.5 * parseInt(originalStrokeWidth, 10);
              node.style.strokeWidth = val.toString();
              node.style.stroke = 'blue';
            }
          });

          node.addEventListener('mouseleave', () => {
            if (active === 'connectInstances') {
              const symbolInstance = getSymbolInstanceByPathId(
                symbolInstances,
                node.id
              );
              if (symbolInstance) {
                symbolInstance.pathIds.forEach((pathId) => {
                  (
                    document.getElementById(pathId) as unknown as SVGElement
                  ).style.stroke = 'pink';
                });
                return;
              }
            }

            node.style.strokeWidth = originalStrokeWidth;
            node.style.stroke = originalStroke;
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
            }
            if (active === 'addLine') {
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
    <SvgViewerWrapper>
      {fileUrl === '' && (
        <input type="file" accept=".svg" onChange={handleFileChange} />
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px auto',
          gridAutoRows: '100%',
          height: '100%',
        }}
      >
        {fileUrl !== '' && (
          <SidePanel
            active={active}
            symbols={symbols}
            lines={lines}
            symbolInstances={symbolInstances}
            selection={selection}
            setActive={setActive}
            loadSymbolsAsJson={loadSymbolsAsJson}
            saveSymbol={saveSymbol}
          />
        )}
        {fileUrl !== '' && (
          <ReactSVGWindow>
            <ReactSVGWrapper ref={viewportRef}>
              <ReactSVG
                style={{ touchAction: 'none' }}
                renumerateIRIElements={false}
                src={fileUrl}
                afterInjection={handleAfterInjection}
                beforeInjection={handleBeforeInjection}
              />
            </ReactSVGWrapper>
            <ZoomButtonsWrapper>
              <ToolBar direction="horizontal" buttonGroups={zoomButtonGroups} />
            </ZoomButtonsWrapper>
          </ReactSVGWindow>
        )}
      </div>
      {existingSymbolPromptData && !existingSymbolPromptData.resolution && (
        <Modal
          title="Symbol name exists"
          visible={!!existingSymbolPromptData}
          // onCancel={() => setExistingSymbolPromptData(null)}
          footer={
            <ModalFooterWrapper>
              <Button
                type="primary"
                icon="Edit"
                onClick={() =>
                  setExistingSymbolPromptData({
                    ...existingSymbolPromptData,
                    resolution: 'rename',
                  })
                }
              >
                Rename
              </Button>
              <Button
                type="primary"
                icon="AddToList"
                onClick={async () => {
                  await setExistingSymbolPromptData({
                    ...existingSymbolPromptData,
                    resolution: 'add',
                  });
                }}
              >
                Add to {existingSymbolPromptData.symbolName}
              </Button>
            </ModalFooterWrapper>
          }
          onCancel={() => setExistingSymbolPromptData(null)}
          appElement={appElement}
        >
          <p>
            Do you want to rename or add this symbol as an instance to{' '}
            {existingSymbolPromptData.symbolName}
          </p>
        </Modal>
      )}
      {existingSymbolPromptData &&
        existingSymbolPromptData.resolution === 'rename' && (
          <Modal
            title="Provide a new name"
            okDisabled={existingSymbolPromptData.symbolName === ''}
            visible={!!existingSymbolPromptData}
            onCancel={() => setExistingSymbolPromptData(null)}
            onOk={() => {
              saveSymbol(
                existingSymbolPromptData.symbolName,
                existingSymbolPromptData.SVGElements
              );
              setExistingSymbolPromptData(null);
            }}
            appElement={appElement}
          >
            <Input
              title="Symbol name"
              onChange={(event) =>
                setExistingSymbolPromptData({
                  ...existingSymbolPromptData,
                  symbolName: event.target.value,
                })
              }
              value={existingSymbolPromptData.symbolName}
              fullWidth
            />
          </Modal>
        )}
    </SvgViewerWrapper>
  );
};
