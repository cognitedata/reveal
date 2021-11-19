import React, { useMemo } from 'react';

import { Body, Colors, Detail, Icon, Loader, Title } from '@cognite/cogs.js';
import { RawDB } from '@cognite/sdk';
import { Carousel } from 'antd';
import styled from 'styled-components';

import icons from 'assets/icons';
import SidePanelGraphic from 'assets/SidePanelGraphic.svg';
import TabsGraphic from 'assets/TabsGraphic.svg';
import { useDatabases } from 'hooks/sdk-queries';

const FIRST_TIME_CAROUSEL_HEIGHT = 330;

const carouselSlides = [
  {
    title: 'Get started with RAW Explorer.',
    detail: 'Create databases to store and organize raw data in tables.',
    imageSrc: SidePanelGraphic,
  },
  {
    title: 'View and compare tables as tabs.',
    detail: 'Open raw data in table format to compare and analyze the content.',
    imageSrc: TabsGraphic,
  },
  {
    title: 'Get out of the box data profiling.',
    detail:
      'Understand structure, content and interrelationships, and identify potential for projects.',
    imageSrc: TabsGraphic,
  },
];

const RawExplorerNotSelected = (): JSX.Element => {
  const { data, isLoading: isFetchingDatabases } = useDatabases();

  const databases = useMemo(
    () =>
      data
        ? data.pages.reduce(
            (accl, page) => [...accl, ...page.items],
            [] as RawDB[]
          )
        : ([] as RawDB[]),
    [data]
  );

  if (isFetchingDatabases) {
    return <Loader />;
  }

  return (
    <StyledRawExplorerNotSelectedWrapper>
      {databases.length ? (
        <StyledRawExplorerReturningUserContent>
          <StyledRawExplorerReturningUserArrow
            src={icons.EmptyStateArrowIcon}
          />
          <Title level={3}>Select a table to view raw data</Title>
          <StyledRawExplorerReturningUserBody>
            Use the side menu to navigate between databases and open raw tables.
          </StyledRawExplorerReturningUserBody>
        </StyledRawExplorerReturningUserContent>
      ) : (
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
      )}
    </StyledRawExplorerNotSelectedWrapper>
  );
};

const StyledRawExplorerNotSelectedWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StyledRawExplorerReturningUserContent = styled.div`
  margin-bottom: 30px;
  position: relative;
  width: 400px;
`;

const StyledRawExplorerReturningUserBody = styled(Body)`
  color: ${Colors['text-hint'].hex()};
  margin-top: 12px;
`;

const StyledRawExplorerReturningUserArrow = styled.img`
  position: absolute;
  left: -225px;
  top: -150px;
`;

const StyledRawExplorerFirstTimeContent = styled.div`
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  height: ${FIRST_TIME_CAROUSEL_HEIGHT}px;
  position: relative;
  width: 642px;

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
`;

const StyledCarouselPage = styled.div`
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
  width: auto;
  margin-left: auto;
`;

export default RawExplorerNotSelected;
