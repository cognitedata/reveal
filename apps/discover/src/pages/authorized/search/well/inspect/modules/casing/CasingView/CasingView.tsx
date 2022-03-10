import React, {
  FC,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import isEmpty from 'lodash/isEmpty';
import max from 'lodash/max';
import orderBy from 'lodash/orderBy';

import { Button } from '@cognite/cogs.js';

import EmptyState from 'components/emptyState';
import { convertToPreviewData } from 'modules/wellSearch/utils/casings';
import { FlexColumn } from 'styles/layout';

import { SelectedWellboreView } from '../../events/Npt/graph';
import { getScaleBlocks } from '../helper';

import DepthColumn from './DepthColumn';
import DepthIndicator from './DepthIndicator/DepthIndicator';
import {
  BodyWrapper,
  RightGutter,
  Wrapper,
  Header,
  MainHeader,
  SubHeader,
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnBody,
  ScaleLine,
  CasingScale,
  EmptyCasingsStateWrapper,
} from './elements';
import EventsColumn from './EventsColumn';
import { CasingViewType } from './interfaces';

const MIN_SCALE_HEIGHT = 16;
const EMPTY_STATE_TEXT = 'This wellbore has no casing and NPT events data';
const EMPTY_SCHEMA_TEXT = 'This wellbore has no schema data';
const LOADING_TEXT = 'Loading';

/**
 * This component is used to generate casings diagram
 */
const CasingView: FC<CasingViewType> = ({
  casings,
  wellName,
  wellboreName,
  unit,
  events = [],
  isEventsLoading,
}: CasingViewType) => {
  const scaleRef = useRef<HTMLElement | null>(null);

  const [recentZIndex, setRecentZIndex] = React.useState(1);

  const casingsList = orderBy(casings, 'endDepth', 'desc');

  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);

  const [selectedWellbore, setSelectedWellbore] = useState<string>();

  const normalizedCasings = useMemo(
    () => convertToPreviewData(casingsList),
    [casingsList]
  );

  const minDepth = 0;
  let maxDepth = max(casingsList.map((row) => Number(row.endDepth))) as number;
  if (isEmpty(casings) && !isEmpty(events)) {
    maxDepth = max(
      events.map((row) => Number(row.measuredDepth?.value))
    ) as number;
  }

  const validEvents = events.filter(
    (event) =>
      event.measuredDepth &&
      event.measuredDepth.value >= minDepth &&
      event.measuredDepth.value <= maxDepth
  );

  const setScaleBlocksCount = () => {
    const height = scaleRef.current?.offsetHeight || MIN_SCALE_HEIGHT;
    setScaleBlocks(getScaleBlocks(height, minDepth, maxDepth));
  };

  useEffect(() => {
    window.addEventListener('resize', setScaleBlocksCount);
    return () => {
      window.removeEventListener('resize', setScaleBlocksCount);
    };
  }, [maxDepth]);

  useEffect(() => {
    setScaleBlocksCount();
  }, [minDepth, maxDepth]);

  // This fires on indicator click event
  const onIndicatorClick = () => {
    // This increments casing view zindex value and return highest value only for clicked casing
    setRecentZIndex((r) => r + 1);
    return recentZIndex;
  };

  return (
    <>
      <Wrapper>
        <Header>
          <FlexColumn>
            <MainHeader>{wellName}</MainHeader>
            <SubHeader>{wellboreName}</SubHeader>
          </FlexColumn>
          <Button
            onClick={() => {
              setSelectedWellbore(wellboreName);
            }}
            title="NPT details"
            disabled={isEmpty(validEvents)}
            className="casings-np-details-button"
          >
            NPT details
          </Button>
        </Header>
        <BodyWrapper>
          {isEmpty(casings) &&
          (isEventsLoading || (!isEventsLoading && isEmpty(events))) ? (
            <EmptyCasingsStateWrapper>
              <EmptyState
                isLoading={isEventsLoading}
                loadingSubtitle={isEventsLoading ? LOADING_TEXT : ''}
                emptySubtitle={EMPTY_STATE_TEXT}
              />
            </EmptyCasingsStateWrapper>
          ) : (
            <>
              <DepthColumn scaleBlocks={scaleBlocks} unit={unit} />
              <BodyColumn width={150}>
                <BodyColumnHeaderWrapper>
                  <BodyColumnMainHeader>Schema</BodyColumnMainHeader>
                </BodyColumnHeaderWrapper>
                <BodyColumnBody>
                  <CasingScale ref={scaleRef}>
                    {isEmpty(casings) ? (
                      <EmptyCasingsStateWrapper>
                        <EmptyState emptySubtitle={EMPTY_SCHEMA_TEXT} />
                      </EmptyCasingsStateWrapper>
                    ) : (
                      scaleBlocks.map((row) => <ScaleLine key={row} />)
                    )}
                  </CasingScale>
                  {normalizedCasings.map((normalizedCasing, index) => (
                    <Fragment key={normalizedCasing.id}>
                      <DepthIndicator
                        startDepth={normalizedCasing.startDepth}
                        casingDepth={normalizedCasing.casingDepth}
                        description={normalizedCasing.casingDescription}
                        outerDiameter={normalizedCasing.outerDiameter}
                        onClick={onIndicatorClick}
                        linerCasing={normalizedCasing.linerCasing}
                      />
                      {/* A trick to have space in right side for lengthiest description */}
                      {casings.length === index + 1 && (
                        <RightGutter>
                          {normalizedCasing.outerDiameter}
                        </RightGutter>
                      )}
                    </Fragment>
                  ))}
                </BodyColumnBody>
              </BodyColumn>
              <EventsColumn
                scaleBlocks={scaleBlocks}
                events={validEvents}
                isEventsLoading={isEventsLoading}
              />
            </>
          )}
        </BodyWrapper>
      </Wrapper>
      {selectedWellbore && (
        <SelectedWellboreView
          events={validEvents}
          selectedWellbore={selectedWellbore}
          disableWellboreNavigation
          setSelectedWellbore={(selected) => {
            if (!selected) {
              setSelectedWellbore(undefined);
            }
          }}
        />
      )}
    </>
  );
};

export default CasingView;
