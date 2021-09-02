import React, { useEffect, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// import Swiper core and required modules
import SwiperCore, {
  Pagination,
  Mousewheel,
  Virtual,
  Navigation,
  Keyboard,
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

SwiperCore.use([Navigation, Mousewheel, Pagination, Virtual, Keyboard]);

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
        slidesPerView={1}
        spaceBetween={4}
        keyboard={{
          enabled: true,
        }}
        breakpoints={{
          '820': {
            slidesPerView: 2,
            spaceBetween: 4,
          },
          '990': {
            slidesPerView: 3,
            spaceBetween: 4,
          },
          '1160': {
            slidesPerView: 4,
            spaceBetween: 4,
          },
          '1500': {
            slidesPerView: 6,
            spaceBetween: 4,
          },
          '1840': {
            slidesPerView: 8,
            spaceBetween: 4,
          },
        }}
        initialSlide={currentSlideIndex}
        navigation
        freeMode
        freeModeSticky
        mousewheel={{
          sensitivity: 2,
          releaseOnEdges: true,
        }}
        grabCursor
        centeredSlides
        virtual={
          files.length > 10
            ? {
                addSlidesBefore: 8,
                addSlidesAfter: 8,
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
  color?: string;
  background?: string;
  disablestyle?: string;
}

const ThumbnailContainer = styled(Button)<OnFocusProp>`
  height: 100%;
  width: 100%;
  padding: 0 !important;
  border: ${(props) =>
    props.focusedid === props.currentid ? '5px solid #4A67FB' : 'none'};
  ${(props) => props.focusedid === props.currentid && 'background: #4A67FB'};
  border-radius: 4px;
  box-sizing: border-box;
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
`;
