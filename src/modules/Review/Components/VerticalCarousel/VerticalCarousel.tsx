import React, { useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper.min.css';
import 'swiper/components/pagination/pagination.min.css';

// import Swiper core and required modules
import SwiperCore, { Pagination, Mousewheel, Virtual } from 'swiper/core';
import styled from 'styled-components';
import { getIdfromUrl } from 'src/utils/tenancy';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { selectAllFiles } from 'src/modules/Common/filesSlice';
import { Thumbnail } from 'src/modules/Common/Components/Thumbnail/Thumbnail';
import { Button } from '@cognite/cogs.js';

SwiperCore.use([Mousewheel, Pagination, Virtual]);

export const VerticalCarousel = (props?: any) => {
  const { prev } = props;
  const filesSlice = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const history = useHistory();
  const initialSlide = Number(getIdfromUrl());
  const [currentSlide, setCurrentSlide] = useState<number>(initialSlide);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(
    filesSlice.findIndex((item: any) => item.id === initialSlide)
  );

  const thumbnailHeight = 66;

  const handleOnClick = (fileId: number) => {
    // For background color / focus
    setCurrentSlide(fileId);
    setCurrentSlideIndex(
      filesSlice.findIndex((item: any) => item.id === fileId)
    );

    // Go to this file
    history.replace(
      getParamLink(workflowRoutes.review, ':fileId', String(fileId)),
      { from: prev }
    );
  };

  const slides = filesSlice.map((data, index) => {
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
  return filesSlice.length > 1 ? (
    <CarouselContainer id="verticalCarouselContainer">
      <Swiper
        className="carouselView"
        slidesPerView={Math.min(filesSlice.length, 10)} // "auto" does not work with virtual
        initialSlide={currentSlideIndex}
        freeMode
        direction="vertical"
        mousewheel={{
          sensitivity: 2,
          releaseOnEdges: true,
        }}
        grabCursor
        centeredSlides
        centeredSlidesBounds
        // TODO: Fix virtual loading
        // virtual
        // virtual={{
        //   addSlidesAfter: 5,
        //   addSlidesBefore: 5,
        // }}
        style={{
          height: `${thumbnailHeight * Math.min(filesSlice.length, 10)}px`, // HACK: to avoid scroll out of view
        }}
      >
        <>{slides}</>
      </Swiper>
    </CarouselContainer>
  ) : null;
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
  flex: '1 0 auto';
  height: ${(props) => `${props.thumbnailheight}px`};
  width: 110px;
  padding-left: 5px !important;
  padding-right: 5px !important;
  padding-top: 0px !important;
  padding-bottom: 0px !important;
  color: ${(props) =>
    props.focusedid === props.currentid ? '#000000' : '#bebebe'};
  background: ${(props) =>
    props.focusedid === props.currentid ? '#6E85FC' : '#ffffff'};
  img {
    height: 85%;
    width: 100%;
    object-fit: cover;
    overflow: hidden;
  }
`;

const CarouselContainer = styled.div`
  max-width: 136px;
  padding: 10px;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
`;
