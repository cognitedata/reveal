/* eslint-disable no-param-reassign */
import * as React from 'react';
import { useState, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
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
import styled from 'styled-components';
import { Modal, Input, Button } from '@cognite/cogs.js';

import { SidePanel } from './components';

const appElement = document.querySelector('#root') || undefined;

let svgDocument: SvgDocument | undefined;

const SvgViewerWrapper = styled.div`
  height: calc(100% - 56px);
  overflow: hidden;
`;

const ReactSVGWrapper = styled.div`
  height: 100%;
  overflow: scroll;
  border: 2px solid;
`;

const ModalFooterWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, max-content);
  justify-content: end;
  gap: 1rem;
`;

type ExistingSymbolPromptData = {
  symbolName: string;
  SVGElements: SVGElement[];
  resolution?: 'add' | 'rename';
} | null;

const originalViewBox = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  isUpdated: false,
};

const viewBox = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  isUpdated: false,
};

let keydownEventListenerAdded = false;
const scrollFactor = 0.15;
const zoomFactor = 0.2;

const updateSvgWithViewbox = () => {
  document
    .getElementById(SVG_ID)
    ?.setAttribute(
      'viewBox',
      `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
    );
};

const moveLeft = () => {
  viewBox.x -= scrollFactor * viewBox.width;
  updateSvgWithViewbox();
};

const moveRight = () => {
  viewBox.x += scrollFactor * viewBox.width;
  updateSvgWithViewbox();
};

const moveUp = () => {
  viewBox.y -= scrollFactor * viewBox.height;
  updateSvgWithViewbox();
};

const moveDown = () => {
  viewBox.y += scrollFactor * viewBox.height;
  updateSvgWithViewbox();
};

const zoomIn = () => {
  const widthChange = zoomFactor * viewBox.width;
  viewBox.width -= widthChange;
  viewBox.x += widthChange / 2;

  const heightChange = zoomFactor * viewBox.height;
  viewBox.height -= heightChange;
  viewBox.y += heightChange / 2;

  updateSvgWithViewbox();
};

const zoomOut = () => {
  const widthChange = zoomFactor * (viewBox.width * (1 / (1 - zoomFactor)));
  viewBox.width += widthChange;
  viewBox.x -= widthChange / 2;

  const heightChange = zoomFactor * (viewBox.height * (1 / (1 - zoomFactor)));
  viewBox.height += heightChange;
  viewBox.y -= heightChange / 2;
  updateSvgWithViewbox();
};

const resetZoom = () => {
  viewBox.x = originalViewBox.x;
  viewBox.y = originalViewBox.y;
  viewBox.width = originalViewBox.width;
  viewBox.height = originalViewBox.height;
  updateSvgWithViewbox();
};

export const SvgViewer = () => {
  const [fileUrl, setFileUrl] = React.useState('');
  const [active, setActive] = React.useState<string>('AddSymbol');

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

  const onkeydown = (e: KeyboardEvent) => {
    if (document.activeElement === document.body) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      switch (e.code) {
        case 'KeyA':
          moveLeft();
          break;
        case 'KeyD':
          moveRight();
          break;
        case 'KeyW':
          moveUp();
          break;
        case 'KeyS':
          moveDown();
          break;
        case 'KeyE':
          zoomIn();
          break;
        case 'KeyQ':
          zoomOut();
          break;
        case 'KeyR':
          resetZoom();
          break;
      }
    }
  };

  React.useEffect(() => {
    if (!keydownEventListenerAdded) {
      keydownEventListenerAdded = true;
      document.addEventListener('keydown', onkeydown);
    }
  });

  const loadSymbolsAsJson = (jsonData: any) => {
    if ('symbols' in jsonData) {
      const newSymbols = jsonData.symbols as DiagramSymbol[];
      setSymbols([...symbols, ...newSymbols]);

      if (svgDocument !== undefined) {
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
  };

  const saveSymbol = (symbolName: string, selection: SVGElement[]) => {
    if (svgDocument === undefined) {
      return;
    }

    const existingSymbolIndex = symbols.findIndex(
      (symbol) => symbol.symbolName === symbolName
    );
    if (
      existingSymbolIndex !== -1 &&
      existingSymbolPromptData?.resolution !== 'add'
    ) {
      setExistingSymbolPromptData({
        symbolName,
        SVGElements: selection,
      });
      return;
    }
    const existingSvgRepresentations: SvgRepresentation[] =
      existingSymbolIndex !== -1
        ? symbols[existingSymbolIndex].svgRepresentations
        : [];

    const internalSvgElems = [];
    for (let i = 0; i < svgDocument.allSvgElements.length; i++) {
      const elem = svgDocument.allSvgElements[i];
      if (selection.filter((e) => e.id === elem.pathId).length !== 0) {
        internalSvgElems.push(elem);
      }
    }

    const newSymbol: DiagramSymbol = {
      ...(existingSymbolIndex !== -1 ? symbols[existingSymbolIndex] : {}),
      symbolName,
      svgRepresentations: [
        ...existingSvgRepresentations,
        {
          boundingBox: getInternalSvgBoundingBox(internalSvgElems),
          svgPaths: internalSvgElems.map(
            (svgElement) =>
              ({
                svgCommands: svgElement.serializeToPathCommands(),
                style: selection
                  .filter((elem) => elem.id === svgElement.pathId)[0]
                  .getAttribute('style'),
              } as SvgPath)
          ),
        },
      ],
    };

    if (existingSymbolPromptData?.resolution === 'add') {
      const newSymbols = [...symbols];
      newSymbols.splice(existingSymbolIndex, 1, newSymbol);
      setSymbols(newSymbols);
    } else {
      setSymbols([...symbols, newSymbol]);
    }

    setSelection([]);

    if (svgDocument !== undefined) {
      const newSymbolInstances =
        svgDocument.findAllInstancesOfSymbol(newSymbol);
      setSymbolInstances([...symbolInstances, ...newSymbolInstances]);
      setExistingSymbolPromptData(null);
    }
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
      const all: SVGElement[] = [];

      if (!viewBox.isUpdated) {
        originalViewBox.x = svg.getBBox().x;
        originalViewBox.y = svg.getBBox().y;
        originalViewBox.width = svg.getBBox().width;
        originalViewBox.height = svg.getBBox().height;
        originalViewBox.isUpdated = true;

        viewBox.x = originalViewBox.x;
        viewBox.y = originalViewBox.y;
        viewBox.width = originalViewBox.width;
        viewBox.height = originalViewBox.height;
        viewBox.isUpdated = true;
      }

      svg.setAttribute(
        'viewBox',
        `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`
      );

      const recursive = (node: SVGElement) => {
        if (node.children.length === 0) {
          if (svgDocument === undefined) {
            all.push(node);
          }
          const originalStrokeWidth = node.style.strokeWidth;
          const originalStroke = node.style.stroke;
          node.addEventListener('mouseenter', () => {
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
            node.style.strokeWidth = originalStrokeWidth;
            node.style.stroke = originalStroke;
          });

          node.addEventListener('click', () => {
            if (active === 'AddSymbol') {
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
            if (active === 'AddLine') {
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
          <ReactSVGWrapper>
            <ReactSVG
              style={{ touchAction: 'none' }}
              renumerateIRIElements={false}
              src={fileUrl}
              afterInjection={handleAfterInjection}
              beforeInjection={handleBeforeInjection}
            />
          </ReactSVGWrapper>
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
