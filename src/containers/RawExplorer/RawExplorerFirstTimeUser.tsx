import React from 'react';

import { Colors, Detail, Icon, Title } from '@cognite/cogs.js';
import { Carousel } from 'antd';
import styled from 'styled-components';

import graphics from 'assets/graphics';

const FIRST_TIME_CAROUSEL_HEIGHT = 330;

const carouselSlides = [
  {
    title: 'Get started with RAW Explorer.',
    detail: 'Create databases to store and organize raw data in tables.',
    imageSrc: graphics.SidePanelGraphic,
  },
  {
    title: 'View and compare tables as tabs.',
    detail: 'Open raw data in table format to compare and analyze the content.',
    imageSrc: graphics.TabsGraphic,
  },
  {
    title: 'Analyze and inspect your data.',
    detail: 'Discover, analyze, and understand critical patterns in your data.',
    imageSrc: graphics.ProfilingGraphic,
  },
];

const RawExplorerFirstTimeUser = (): JSX.Element => {
  return (
    <StyledRawExplorerFirstTimeWrapper>
      <StyledRawExplorerFirstTimeContent>
        <Carousel
          arrows
          autoplay
          dots={{ className: 'first-time-carousel-dot' }}
          prevArrow={<Icon type="ChevronLeftLarge" />}
          nextArrow={<Icon type="ChevronRightLarge" />}
        >
          {carouselSlides.map(({ title, detail, imageSrc }) => (
            <StyledCarouselPage key={title}>
              <StyledCarouselPageContent>
                <StyledCarouselPageTitle level={4}>
                  {title}
                </StyledCarouselPageTitle>
                <StyledCarouselPageDetail>{detail}</StyledCarouselPageDetail>
              </StyledCarouselPageContent>
              <StyledCarouselPageImage src={imageSrc} />
            </StyledCarouselPage>
          ))}
        </Carousel>
      </StyledRawExplorerFirstTimeContent>
    </StyledRawExplorerFirstTimeWrapper>
  );
};

const StyledRawExplorerFirstTimeWrapper = styled.div`
  align-items: center;
  background-color: ${Colors['bg-accent'].hex()};
  display: flex;
  justify-content: center;
  height: 100%;
`;

const StyledRawExplorerFirstTimeContent = styled.div`
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  height: ${FIRST_TIME_CAROUSEL_HEIGHT}px;
  position: relative;
  width: 642px;

  &&& {
    .first-time-carousel-dot {
      li button {
        background-color: ${Colors['bg-control--disabled-hover'].hex()};
        border-radius: 8px;
        height: 8px;
      }
      li.slick-active button {
        background-color: ${Colors['text-hint'].hex()};
      }
    }

    .ant-carousel {
      .slick-prev,
      .slick-next {
        color: currentColor;
        font-size: inherit;
        z-index: 1;
        ::before {
          content: none;
        }
      }
      .slick-prev {
        left: 16px;
      }
      .slick-next {
        right: 16px;
      }
    }
  }
`;

const StyledCarouselPage = styled.div`
  background-color: ${Colors.white};
  border-radius: 16px;
  display: flex !important; /* overrides antd style */
  height: ${FIRST_TIME_CAROUSEL_HEIGHT}px;
  padding: 0px 48px 48px;
`;

const StyledCarouselPageContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 100px 16px 0 0;
  height: 100%;
  width: 200px;
`;

const StyledCarouselPageTitle = styled(Title)`
  color: ${Colors['text-primary'].hex()};
  margin-bottom: 16px;
`;

const StyledCarouselPageDetail = styled(Detail)`
  color: ${Colors['text-hint'].hex()};
`;

const StyledCarouselPageImage = styled.img`
  height: 280px;
  width: auto;
  margin-left: auto;
`;

export default RawExplorerFirstTimeUser;
