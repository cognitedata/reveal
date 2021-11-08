/* eslint-disable no-param-reassign */
import * as React from 'react';
import { ReactSVG } from 'react-svg';
import {
  findAllInstancesOfSymbol,
  SvgPath,
  DiagramSymbol,
  DiagramSymbolInstance,
} from '@cognite/pid-tools';
import styled from 'styled-components';

import { SideView } from './SideView';

const SvgViewerWrapper = styled.div`
  height: 100%;
  overflow: hidden;
`;

const ReactSVGWrapper = styled.div`
  height: 100%;
  overflow: scroll;
  border: 2px solid;
`;

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
    .getElementById('svg-id')
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
  const [symbols, setSymbols] = React.useState<DiagramSymbol[]>([]);
  const [symbolInstances, setSymbolInstances] = React.useState<
    DiagramSymbolInstance[]
  >([]);
  const all: SVGElement[] = [];

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

      let allNewSymbolInstances: DiagramSymbolInstance[] = [];
      newSymbols.forEach((newSymbol) => {
        const newSymbolInstances = findAllInstancesOfSymbol(all, newSymbol);
        allNewSymbolInstances = [
          ...allNewSymbolInstances,
          ...newSymbolInstances,
        ];
      });
      setSymbolInstances([...symbolInstances, ...allNewSymbolInstances]);
    }
  };

  const saveSymbol = (symbolName: string, selection: SVGElement[]) => {
    const bBoxes = selection.map((svgElement) =>
      (
        document.querySelector(`#${svgElement.id}`) as unknown as SVGPathElement
      ).getBBox()
    );
    const coords = {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    };
    bBoxes.forEach((bBox) => {
      coords.minX = Math.min(coords.minX, bBox.x);
      coords.minY = Math.min(coords.minY, bBox.y);
      coords.maxX = Math.max(coords.maxX, bBox.x + bBox.width);
      coords.maxY = Math.max(coords.maxY, bBox.y + bBox.height);
    });
    const newSymbol = {
      symbolName,
      svgPaths: selection.map((svgElement) => {
        return {
          svgCommands: svgElement.getAttribute('d') as string,
          style: svgElement.getAttribute('style'),
        } as SvgPath;
      }),
      boundingBox: {
        x: coords.minX,
        y: coords.minY,
        width: coords.maxX - coords.minX,
        height: coords.maxY - coords.minY,
      },
    };

    setSymbols([...symbols, newSymbol]);

    setSelection([]);

    const newSymbolInstances = findAllInstancesOfSymbol(all, newSymbol);
    setSymbolInstances([...symbolInstances, ...newSymbolInstances]);
  };

  const handleBeforeInjection = (svg?: SVGSVGElement) => {
    // console.log('handleBeforeInjection svg', svg);
    if (svg) {
      svg.id = 'svg-id';
      svg.style.width = '100%';
      svg.style.height = '100%';

      const recursive = (node: SVGElement) => {
        if (node.children.length === 0) {
          all.push(node);

          if (selection.some((svgPath) => svgPath.id === node.id)) {
            node.style.stroke = 'red';
            const val = 1.5 * parseInt(node.style.strokeWidth, 10);
            node.style.strokeWidth = val.toString();
          }

          if (
            symbolInstances.some((symbolInst) =>
              symbolInst.svgElements.some((path) => path.id === node.id)
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
          <SideView
            active={active}
            symbols={symbols}
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
    </SvgViewerWrapper>
  );
};
