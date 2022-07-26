import React from 'react';

import { Colors, Detail, Icon, Title } from '@cognite/cogs.js';
import { Carousel } from 'antd';
import styled from 'styled-components';

import graphics from 'assets/graphics';
import { useTranslation } from 'common/i18n';

const FIRST_TIME_CAROUSEL_HEIGHT = 330;

const RawExplorerFirstTimeUser = (): JSX.Element => {
  const { t } = useTranslation();

  const carouselSlides = [
    {
      title: t('first-time-user-title-get-started'),
      detail: t('first-time-user-detail-get-started'),
      imageSrc: graphics.SidePanelGraphic,
    },
    {
      title: t('first-time-user-title-view-compare'),
      detail: t('first-time-user-detail-view-compare'),
      imageSrc: graphics.TabsGraphic,
    },
    {
      title: t('first-time-user-title-analyze-inspect'),
      detail: t('first-time-user-detail-analyze-inspect'),
      imageSrc: graphics.ProfilingGraphic,
    },
  ];

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
