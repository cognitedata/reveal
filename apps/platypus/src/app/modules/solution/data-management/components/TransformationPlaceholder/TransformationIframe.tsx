import { createLink } from '@cognite/cdf-utilities';
import { css } from 'styled-components';

export function TransformationIframe({
  transformationId,
}: {
  transformationId: number | undefined;
}) {
  return transformationId ? (
    <iframe
      title="transformation"
      id="transformationIframe"
      width="100%"
      height="100%"
      style={{ border: 'none' }}
      src={createLink(`/transformations/${transformationId}`)}
      onLoad={() => {
        const new_style_element = document.createElement('style');
        new_style_element.textContent = css`
          #navigation,
          #transformations-config,
          #transformations-breadcrumb,
          #transformation-expand-button {
            display: none;
          }
          .transformations-style-scope > div {
            height: 100%;
            top: 0;
          }
          #transformation-editor-container {
            margin: 0;
            border: none;
          }
        `.toString();
        const frame = document.getElementById(
          'transformationIframe'
        ) as HTMLIFrameElement;
        frame.contentDocument?.head.appendChild(new_style_element);
      }}
    />
  ) : null;
}
