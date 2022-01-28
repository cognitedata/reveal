import debounce from 'lodash-es/debounce';
import React, { useEffect, useMemo, useState } from 'react';
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
import { Thumbnail } from 'src/modules/Common/Components/Thumbnail/Thumbnail';
import { Button, Icon } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
// Import Swiper styles
import swiperStyles from 'swiper/swiper-bundle.css';

SwiperCore.use([Navigation, Mousewheel, Pagination, Virtual, Keyboard]);

export const ThumbnailCarousel = (props: {
  files: FileInfo[];
  onItemClick: (fileId: number) => void;
}) => {
  const { files } = props;

  const initialSlide = Number(getIdfromUrl());
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(
    files.findIndex((item: any) => item.id === initialSlide)
  );
  const [swiperRef, setSwiperRef] = useState<SwiperCore | null>(null);

  const debouncedOnItemClick = useMemo(
    () => debounce(props.onItemClick, 300),
    [props.onItemClick]
  );

  useEffect(() => {
    swiperStyles.use();
    return () => {
      swiperStyles.unuse();
    };
  }, []);

  useEffect(() => {
    const idFromUrl = +getIdfromUrl();
    const currentFileIndex = files.findIndex(
      (item: any) => item.id === idFromUrl
    );
    if (
      idFromUrl &&
      currentFileIndex !== -1 &&
      currentFileIndex !== currentSlideIndex
    ) {
      setCurrentSlideIndex(currentFileIndex);
    }
  }, [files]);

  const handleOnClick = (fileId: number) => {
    // For background color / focus
    setCurrentSlideIndex(files.findIndex((item: any) => item.id === fileId));

    debouncedOnItemClick(fileId);
  };

  const selectNextOrPrevItem = (prev?: boolean) => {
    let fileId;
    let index;
    if (prev) {
      index = currentSlideIndex - 1;
      if (index >= 0) {
        fileId = files[index].id;
      }
    } else {
      index = currentSlideIndex + 1;
      if (index < files.length) {
        fileId = files[index].id;
      }
    }
    if (fileId && (index || index === 0)) {
      setCurrentSlideIndex(index);
      debouncedOnItemClick(fileId);
      if (swiperRef) {
        swiperRef.slideTo(index);
      }
    }
  };

  const onKeyPress = (swiper: any, keyCode: string) => {
    if (+keyCode === 37) {
      selectNextOrPrevItem(true);
    } else if (+keyCode === 39) {
      selectNextOrPrevItem();
    }
    return true;
  };

  const slides = files.map((data, index) => {
    return (
      /* eslint-disable react/no-array-index-key */
      <SwiperSlide
        key={`${index}-swiperslide`}
        virtualIndex={+index}
        className={index === currentSlideIndex ? 'active' : ''}
      >
        <ThumbnailContainer
          key={`${index}-navButton`}
          focusedid={`${currentSlideIndex}`}
          thumbnailid={`${index}`}
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
      <NavigateLeftButton
        onClick={() => selectNextOrPrevItem(true)}
        className="prev-button"
      >
        <NavigateLeft>
          <Icon type="ChevronLeftMicro" />
        </NavigateLeft>
      </NavigateLeftButton>
      <NavigateRightButton
        onClick={() => selectNextOrPrevItem()}
        className="next-button"
      >
        <NavigateRight>
          <Icon type="ChevronRightMicro" />
        </NavigateRight>
      </NavigateRightButton>
      <Swiper
        className="carouselView"
        onSwiper={setSwiperRef}
        slidesPerView={1}
        spaceBetween={4}
        onKeyPress={onKeyPress}
        keyboard={{
          enabled: true,
        }}
        navigation={{
          nextEl: '.next-button',
          prevEl: '.prev-button',
          disabledClass: 'disabledClass',
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
                addSlidesBefore: 4,
                addSlidesAfter: 4,
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
  focusedid: string;
  thumbnailid: string;
  color?: string;
  background?: string;
  disablestyle?: string;
}

const ThumbnailContainer = styled(Button)<OnFocusProp>`
  height: 100%;
  width: 100%;
  padding: 0 !important;
  border: ${(props) =>
    props.focusedid === props.thumbnailid ? '5px solid #4A67FB' : 'none'};
  ${(props) => props.focusedid === props.thumbnailid && 'background: #4A67FB'};
  border-radius: 4px;
  box-sizing: border-box;
  opacity: ${(props) => (props.focusedid === props.thumbnailid ? '1' : '0.6')};
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    overflow: hidden;
  }
`;

const CarouselContainer = styled.div`
  width: 100%;
  height: 120px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  border: 1px solid #d9d9d9;
  position: relative;

  .swiper-slide.active {
    transition: height 0.5s ease-in-out, width 0.2s ease-in-out;
    transform: scaleY(1.1) scaleX(1.04);
  }
  .swiper-container {
    padding: 5px 0;
  }
`;

/* eslint-disable @cognite/no-number-z-index */
const NavigationIconContainer = styled.div`
  height: 32px;
  width: 20px;
  background-color: black;
  color: white;
  border: 1px solid white;
  border-radius: 4px;
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;
const NavigationButton = styled(Button)`
  height: 100%;
  width: 60px;
  color: transparent;
  background: transparent;
  position: absolute;
  z-index: 1000;

  &:focus {
    background-color: rgba(255, 255, 255, 0.5);
  }
`;
const NavigateLeftButton = styled(NavigationButton)`
  left: 0;
`;
const NavigateRightButton = styled(NavigationButton)`
  right: 0;
`;

const NavigateLeft = styled(NavigationIconContainer)`
  left: 12px;
`;
const NavigateRight = styled(NavigationIconContainer)`
  right: 12px;
`;
/* eslint-enable @cognite/no-number-z-index */
