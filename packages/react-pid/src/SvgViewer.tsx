/* eslint-disable no-param-reassign */
import * as React from 'react';
import { ReactSVG } from 'react-svg';

import { ToolBar } from './ToolBar';

export const SvgViewer = () => {
  const [fileUrl, setFileUrl] = React.useState('');
  const [currentMode, setCurrentMode] = React.useState<string>('');

  const [selection, setSelection] = React.useState<string[]>([]);

  // console.log('selection', selection);

  const handleBeforeInjection = (svg?: SVGSVGElement) => {
    // console.log('handleBeforeInjection svg', svg);

    if (svg) {
      const recursive = (
        node: SVGElement,
        action?: (node: SVGElement) => void
      ) => {
        if (node.children.length === 0) {
          if (action && selection.includes(node.id)) {
            action(node);
          }
        } else {
          for (let j = 0; j < node.children.length; j++) {
            const child = node.children[j] as SVGElement;
            recursive(child, action);
          }
        }
      };

      const makeRed = (node: SVGElement) => {
        node.style.stroke = 'red';
      };

      for (let j = 0; j < svg.children.length; j++) {
        const child = svg.children[j] as SVGElement;
        if (child.tagName === 'g') {
          recursive(child, makeRed);
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
