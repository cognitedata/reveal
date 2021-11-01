/* eslint-disable no-param-reassign */
import * as React from 'react';
import { ReactSVG } from 'react-svg';
import { findSimilar, Instance } from '@cognite/pid-tools';

import { ToolBar } from './ToolBar';

export const SvgViewer = () => {
  const [fileUrl, setFileUrl] = React.useState('');
  const [currentMode, setCurrentMode] = React.useState<string>('');

  const [selection, setSelection] = React.useState<string[]>([]);
  const [instances, setInstances] = React.useState<Instance[]>([]);
  const all: SVGElement[] = [];
  // console.log('selection', selection);
  const saveSymbol = (symbolName: string) => {
    const instance = new Instance(selection, symbolName);
    const similar = findSimilar(all, instance);
    const newInstances = [instance];
    similar.forEach((e: any) => {
      newInstances.push(new Instance(e, instance.symbolName));
    });
    setInstances([...instances, ...newInstances]);
    setSelection([]);
  };
  const handleBeforeInjection = (svg?: SVGSVGElement) => {
    // console.log('handleBeforeInjection svg', svg);

    if (svg) {
      const recursive = (node: SVGElement) => {
        if (node.children.length === 0) {
          all.push(node);
          if (selection.includes(node.id)) {
            makeRed(node);
          }

          if (
            instances.map((e) => e.pathIds.includes(node.id)).includes(true)
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

      const makeRed = (node: SVGElement) => {
        node.style.stroke = 'red';
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
      const recursive = (node: SVGElement) => {
        if (node.children.length === 0) {
          const originalStrokeWidth = node.style.strokeWidth;
          const originalStroke = node.style.stroke;

          node.addEventListener('mouseenter', () => {
            const val = 3 * parseInt(originalStrokeWidth, 10);
            node.style.strokeWidth = val.toString();
            node.style.stroke = 'blue';
          });

          node.addEventListener('mouseleave', () => {
            node.style.strokeWidth = originalStrokeWidth;
            node.style.stroke = originalStroke;
          });
          node.addEventListener('click', () => {
            if (currentMode !== '') {
              // console.log(node.id);
              setSelection([...selection, node.id]);
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
    <div>
      <ToolBar
        setMode={setCurrentMode}
        mode={currentMode}
        setSelected={setSelection}
        saveSymbol={saveSymbol}
      />
      <input type="file" onChange={handleFileChange} />
      <ReactSVG
        renumerateIRIElements={false}
        src={fileUrl}
        afterInjection={handleAfterInjection}
        beforeInjection={handleBeforeInjection}
      />
    </div>
  );
};
