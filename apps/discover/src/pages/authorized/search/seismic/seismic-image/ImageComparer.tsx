import { useState, useEffect, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import get from 'lodash/get';
import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { Slices } from 'modules/seismicSearch/types';

import { ColourButtonContainer } from './ColourButtonContainer';
import { ImageCompareDragger } from './ImageCompareDragger';
import items from './SeismicColors';
import { SeismicImagePreviewImage } from './SeismicPreview';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-grow: 1;
`;

export const ImageComparer = ({
  leftSlice,
  rightSlice,
}: {
  leftSlice: Slices;
  rightSlice: Slices;
}) => {
  const [leftImageWidth, setLeftImageWidth] = useState(200);
  const [imageWidth, setImageWidth] = useState(200);
  const [colorScale, setColorScale] = useState(items[0].id);
  const refEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const content = get(leftSlice, 'data.content');
    if (content) {
      const width = content.length;
      setLeftImageWidth(width / 2);
      setImageWidth(width);
    }
  }, [leftSlice, rightSlice]);

  const handleMouseMove = (event: MouseEvent) => {
    if (refEl?.current) {
      const { left } = refEl.current.getBoundingClientRect();
      let pos = event.clientX - left;
      if (pos > imageWidth) {
        pos = imageWidth;
      }
      setLeftImageWidth(pos < 0 ? 0 : pos);
    }
  };

  const handleMouseUp = () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = () => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <ColourButtonContainer setColorScale={setColorScale} />
      <Container>
        <div ref={refEl}>
          <Scrollbars style={{ width: imageWidth + 10 }}>
            <div
              style={{
                position: 'absolute',
                overflow: 'hidden',
                zIndex: layers.SEISMIC_PREVIEW,
                borderRight: '1px white solid',
                top: 0,
                width: leftImageWidth,
              }}
            >
              <SeismicImagePreviewImage
                disableZoom
                slice={leftSlice}
                colorScale={colorScale}
              />
            </div>
            <ImageCompareDragger
              position={leftImageWidth}
              handleMouseDown={handleMouseDown}
            />
            <div style={{ position: 'absolute', top: 0 }}>
              <SeismicImagePreviewImage
                disableZoom
                slice={rightSlice}
                colorScale={colorScale}
              />
            </div>
          </Scrollbars>
        </div>
      </Container>
    </>
  );
};

export default ImageComparer;
