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
import noop from 'lodash/noop';
import orderBy from 'lodash/orderBy';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { convertToPreviewData } from 'modules/wellSearch/utils/casings';
import { FlexColumn } from 'styles/layout';

import DepthColumn from '../../common/Events/DepthColumn';
import {
  ScaleLine,
  DepthMeasurementScale,
  BodyWrapper,
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnBody,
} from '../../common/Events/elements';
import EventsByDepth from '../../common/Events/EventsByDepth';
import { filterNdsByDepth, filterNptByDepth } from '../../common/Events/utils';
import { SelectedWellboreNptView } from '../../events/Npt/graph';
import { SelectedWellbore } from '../../events/Npt/graph/types';
import { SIDE_MODES } from '../constants';
import { getScaleBlocks } from '../helper';

import {
  NPT_EVENT_DETAILS_LABEL,
  NDS_EVENT_DETAILS_LABEL,
  EMPTY_STATE_TEXT,
  EMPTY_SCHEMA_TEXT,
  LOADING_TEXT,
} from './constants';
import DepthIndicator from './DepthIndicator/DepthIndicator';
import {
  DepthIndicatorGutter,
  Wrapper,
  Header,
  MainHeader,
  SubHeader,
  EmptyCasingsStateWrapper,
} from './elements';
import { CasingViewTypeProps } from './interfaces';
import { getMinMaxDepth, isTied, mirrorCasingData } from './utils';

const MIN_SCALE_HEIGHT = 16;

/**
 * This component is used to generate casings diagram
 */
const CasingView: FC<CasingViewTypeProps> = ({
  casings,
  wellName,
  wellboreName,
  unit,
  nptEvents = [],
  ndsEvents = [],
  isNptEventsLoading,
  isNdsEventsLoading,
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

  const [minDepth, maxDepth] = getMinMaxDepth(casingsList, nptEvents);

  const validNptEvents = useMemo(
    () => filterNptByDepth(nptEvents, minDepth, maxDepth),
    [minDepth, maxDepth, nptEvents]
  );

  const validNdsEvents = useMemo(
    () => filterNdsByDepth(ndsEvents, minDepth, maxDepth),
    [minDepth, maxDepth, ndsEvents]
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
          <Dropdown
            content={
              <Menu>
                <Menu.Item onClick={noop} disabled>
                  {NDS_EVENT_DETAILS_LABEL}
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    setSelectedWellbore(wellboreName);
                  }}
                >
                  {NPT_EVENT_DETAILS_LABEL}
                </Menu.Item>
              </Menu>
            }
          >
            <Button icon="ChevronDown" iconPlacement="right">
              Details
            </Button>
          </Dropdown>
        </Header>

        <BodyWrapper>
          {isEmpty(casings) &&
          (isNptEventsLoading ||
            (!isNptEventsLoading && isEmpty(nptEvents))) ? (
            <EmptyCasingsStateWrapper>
              <EmptyState
                isLoading={isNptEventsLoading}
                loadingSubtitle={isNptEventsLoading ? LOADING_TEXT : ''}
                emptySubtitle={EMPTY_STATE_TEXT}
              />
            </EmptyCasingsStateWrapper>
          ) : (
            <>
              <DepthColumn
                scaleBlocks={scaleBlocks}
                unit={unit}
                measurementUnit={DepthMeasurementUnit.MD}
              />
              <BodyColumn width={150}>
                <BodyColumnHeaderWrapper>
                  <BodyColumnMainHeader>Schema</BodyColumnMainHeader>
                </BodyColumnHeaderWrapper>
                <BodyColumnBody>
                  <DepthMeasurementScale ref={scaleRef}>
                    {isEmpty(casings) ? (
                      <EmptyCasingsStateWrapper>
                        <EmptyState emptySubtitle={EMPTY_SCHEMA_TEXT} />
                      </EmptyCasingsStateWrapper>
                    ) : (
                      scaleBlocks.map((row) => <ScaleLine key={row} />)
                    )}
                  </DepthMeasurementScale>

                  {normalizedCasings.map((normalizedCasing, index) => (
                    <Fragment key={normalizedCasing.id}>
                      {/* A trick to have space in left side */}
                      {index === 0 && (
                        <DepthIndicatorGutter>
                          {normalizedCasing.outerDiameter}
                        </DepthIndicatorGutter>
                      )}
                      <DepthIndicator
                        normalizedCasing={normalizedCasing}
                        isTied={isTied(normalizedCasings, index)}
                      />
                      {/* A trick to have space in right side */}
                      {index === normalizedCasings.length - 1 && (
                        <DepthIndicatorGutter>
                          {normalizedCasing.outerDiameter}
                        </DepthIndicatorGutter>
                      )}
                    </Fragment>
                  ))}
                </BodyColumnBody>
              </BodyColumn>

              {/**
                  Render NPT and NDS Events vs MD
               */}
              <EventsByDepth
                ndsEvents={validNdsEvents}
                nptEvents={validNptEvents}
                isNdsEventsLoading={isNdsEventsLoading}
                isNptEventsLoading={isNptEventsLoading}
                scaleBlocks={scaleBlocks}
              />
            </>
          )}
        </BodyWrapper>
      </Wrapper>

      <SelectedWellboreNptView
        events={validNptEvents}
        selectedWellbore={selectedWellbore}
        setSelectedWellbore={setSelectedWellbore}
        disableWellboreNavigation
      />
    </>
  );
};

export default CasingView;
