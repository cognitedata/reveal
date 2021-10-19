import { useState } from 'react';
import { ReactSVG } from 'react-svg';

export const SvgViewer = () => {
  const handleAfterInjection = (error: Error | null, svg?: SVGSVGElement) => {
    if (error) {
      return;
    }

    if (svg) {
      const recursive = (node: SVGElement) => {
        if (node.children.length === 0) {
          const originalStorkeWidth = node.style.strokeWidth;
          const originalStorke = node.style.stroke;

          node.addEventListener('mouseenter', () => {
            const val = 3 * parseInt(originalStorkeWidth, 10);
            node.style.strokeWidth = val.toString(); // eslint-disable-line no-param-reassign
            node.style.stroke = 'blue'; // eslint-disable-line no-param-reassign
          });

          node.addEventListener('mouseleave', () => {
            node.style.strokeWidth = originalStorkeWidth; // eslint-disable-line no-param-reassign
            node.style.stroke = originalStorke; // eslint-disable-line no-param-reassign
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

  const [fileUrl, setFileUrl] = useState('');

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <ReactSVG src={fileUrl} afterInjection={handleAfterInjection} />
    </div>
  );
};
