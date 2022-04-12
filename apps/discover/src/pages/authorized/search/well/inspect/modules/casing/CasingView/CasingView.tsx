import {
  FC,
  Fragment,
  useCallback,
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
import { useDeepMemo } from 'hooks/useDeep';
import { NPTEvent, PreviewCasingType } from 'modules/wellSearch/types';
import { convertToPreviewData } from 'modules/wellSearch/utils/casings';
import { FlexColumn } from 'styles/layout';

import { SelectedWellboreView } from '../../events/Npt/graph';
import { SelectedWellbore } from '../../events/Npt/graph/types';
import { SIDE_MODES } from '../constants';
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
import { CasingType, CasingViewTypeProps } from './interfaces';

const MIN_SCALE_HEIGHT = 16;
const EMPTY_STATE_TEXT = 'This wellbore has no casing and NPT events data';
const EMPTY_SCHEMA_TEXT = 'This wellbore has no schema data';
const LOADING_TEXT = 'Loading';

const mirrorCasingData = (data: PreviewCasingType[]) => {
  const reverseData = data.reduce((accumulator, item) => {
    // the '*-1' for the duplicate/mirrored casing seems to be the easiest way to get a unique id that will not clash with any existing ones
    return [{ ...item, id: item.id * -1 }, ...accumulator];
  }, [] as PreviewCasingType[]);

  return [...reverseData, ...data];
};

const getMinMaxDepth = (casingsList: CasingType[], events: NPTEvent[]) => {
  const minDepth = 0;

  let maxDepth = max(casingsList.map((row) => Number(row.endDepth))) as number;
  if (isEmpty(casingsList) && !isEmpty(events)) {
    maxDepth = max(
      events.map((row) => Number(row.measuredDepth?.value))
    ) as number;
  }

  return [minDepth, maxDepth];
};

/**
 * This component is used to generate casings diagram
 */
const CasingView: FC<CasingViewTypeProps> = ({
  casings,
  wellName,
  wellboreName,
  unit,
  events = [],
  isEventsLoading,
  sideMode,
}) => {
  const scaleRef = useRef<HTMLElement | null>(null);

  const [scaleBlocks, setScaleBlocks] = useState<number[]>([]);
  const [selectedWellbore, setSelectedWellbore] = useState<SelectedWellbore>();

  const casingsList = useDeepMemo(
    () => orderBy(casings, 'endDepth', 'desc'),
    [casings]
  );

  const normalizedCasings = useMemo(() => {
    const data = convertToPreviewData(casingsList);

    if (sideMode === SIDE_MODES.Both) {
      return mirrorCasingData(data);
    }

    // Side mode = one / fallback
    return data;
  }, [casingsList, sideMode]);

  const [minDepth, maxDepth] = getMinMaxDepth(casingsList, events);

  const validEvents = events.filter(
    (event) =>
      event.measuredDepth &&
      event.measuredDepth.value >= minDepth &&
      event.measuredDepth.value <= maxDepth
  );

  const setScaleBlocksCount = useCallback(() => {
    const height = scaleRef.current?.offsetHeight || MIN_SCALE_HEIGHT;
    setScaleBlocks(getScaleBlocks(height, minDepth, maxDepth));
  }, [minDepth, maxDepth]);

  useEffect(() => {
    window.addEventListener('resize', setScaleBlocksCount);
    return () => {
      window.removeEventListener('resize', setScaleBlocksCount);
    };
  }, [setScaleBlocksCount]);

  useEffect(() => {
    setScaleBlocksCount();
  }, [setScaleBlocksCount]);

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
                      <DepthIndicator normalizedCasing={normalizedCasing} />
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

      <SelectedWellboreView
        events={validEvents}
        selectedWellbore={selectedWellbore}
        setSelectedWellbore={setSelectedWellbore}
        disableWellboreNavigation
      />
    </>
  );
};

export default CasingView;
