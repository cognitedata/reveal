import React, { useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper.min.css';
import 'swiper/components/pagination/pagination.min.css';

// import Swiper core and required modules
import SwiperCore, { Pagination, Mousewheel } from 'swiper/core';
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

SwiperCore.use([Mousewheel, Pagination]);

export const VerticalCarousel = () => {
  const filesSlice = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const history = useHistory();

  const initId = getIdfromUrl();
  const [imgInFocus, setImgInFocus] = useState(initId);
  const [currentSlide, setCurrentSlide] = useState<number>();
  const onImgClick = (k: any) => {
    // For background color / focus
    setImgInFocus(k.id);
    setCurrentSlide(1); // Todo: fix mapping
    // Go to this file
    history.replace(
      getParamLink(workflowRoutes.review, ':fileId', String(k.id))
    );
  };

  return (
    <>
      <Swiper
        slidesPerView="auto"
        initialSlide={currentSlide}
        freeMode
        direction="vertical"
        mousewheel={{ sensitivity: 2 }}
        grabCursor
        className="mySwiper"
        style={{ height: '200px' }}
        pagination={{
          clickable: true,
        }}
      >
        <>
          {Object.entries(filesSlice).map(([k, v]) => {
            return (
              <SwiperSlide key={`${k}-swiperslide`}>
                <ImgNavButton
                  key={`${k}-navbutton`}
                  focusedid={imgInFocus}
                  currentid={String(v.id)}
                  onClick={() => onImgClick(v)}
                  aria-label={`${k} icon`}
                >
                  <Thumbnail key={`${k}-thumbnail`} fileInfo={v} />
                </ImgNavButton>
              </SwiperSlide>
            );
          })}
        </>
      </Swiper>
    </>
  );
};

interface OnFocusProp {
  focusedid: string;
  currentid: string;
  color?: string;
  background?: string;
  disablestyle?: string;
}

const ImgNavButton = styled(Button)<OnFocusProp>`
  flex: '1 0 auto';
  height: 66px;
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
