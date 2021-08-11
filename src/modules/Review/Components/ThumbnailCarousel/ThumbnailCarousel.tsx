import React, { useEffect, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// import Swiper core and required modules
import SwiperCore, {
  Pagination,
  Mousewheel,
  Virtual,
  Navigation,
} from 'swiper/core';
import styled from 'styled-components';
import { getIdfromUrl } from 'src/utils/tenancy';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import { Thumbnail } from 'src/modules/Common/Components/Thumbnail/Thumbnail';
import { Button } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
// Import Swiper styles
import swiperStyles from 'swiper/swiper-bundle.css';

SwiperCore.use([Navigation, Mousewheel, Pagination, Virtual]);

export const ThumbnailCarousel = (props: {
  prev?: string;
  files: FileInfo[];
}) => {
  const { prev, files } = props;
  const history = useHistory();
  const initialSlide = Number(getIdfromUrl());
  const [currentSlide, setCurrentSlide] = useState<number>(initialSlide);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(
    files.findIndex((item: any) => item.id === initialSlide)
  );

  const thumbnailHeight = 100;

  useEffect(() => {
    swiperStyles.use();
    return () => {
      swiperStyles.unuse();
    };
  }, []);

  const handleOnClick = (fileId: number) => {
    // For background color / focus
    setCurrentSlide(fileId);
    setCurrentSlideIndex(files.findIndex((item: any) => item.id === fileId));

    // Go to this file
    history.replace(
      getParamLink(workflowRoutes.review, ':fileId', String(fileId)),
      { from: prev }
    );
  };

  const slides = files.map((data, index) => {
    return (
      /* eslint-disable react/no-array-index-key */
      <SwiperSlide key={`${index}-swiperslide`} virtualIndex={+index}>
        <ThumbnailContainer
          key={`${index}-navButton`}
          focusedid={`${currentSlide}`}
          currentid={`${data.id}`}
          thumbnailheight={thumbnailHeight}
          onClick={() => handleOnClick(data.id)}
          aria-label={`${index} icon`}
        >
          <Thumbnail key={`${index}-thumbnail`} fileInfo={data} />
        </ThumbnailContainer>
      </SwiperSlide>
    );
  });
  return (
    <CarouselContainer id="verticalCarouselContainer">
      <Swiper
        className="carouselView"
        slidesPerView={Math.min(files.length, 10)} // "auto" does not work with virtual
        initialSlide={currentSlideIndex}
        navigation
        freeMode
        freeModeSticky
        mousewheel={{
          sensitivity: 2,
          releaseOnEdges: true,
        }}
        grabCursor
        virtual={
          files.length > 10
            ? {
                addSlidesBefore: 5,
                addSlidesAfter: 5,
              }
            : false
        }
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <>{slides}</>
      </Swiper>
    </CarouselContainer>
  );
};

interface OnFocusProp {
  // NOTE: need to be lowercase, otherwise warnings
  focusedid: string;
  currentid: string;
  thumbnailheight: number;
  color?: string;
  background?: string;
  disablestyle?: string;
}

const ThumbnailContainer = styled(Button)<OnFocusProp>`
  height: ${(props) => `${props.thumbnailheight}px`};
  width: 150px;
  padding: 0 !important;
  border: ${(props) =>
    props.focusedid === props.currentid ? '5px solid #4A67FB' : 'none'};
  ${(props) => props.focusedid === props.currentid && 'background: #4A67FB'};
  border-radius: 4px;
  box-sizing: content-box;
  opacity: ${(props) => (props.focusedid === props.currentid ? '1' : '0.6')};
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    overflow: hidden;
  }
`;

const CarouselContainer = styled.div`
  width: 100%;
  padding: 4px;
  height: 120px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  border: 1px solid #d9d9d9;

  .swiper-slide {
    width: 160px !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
