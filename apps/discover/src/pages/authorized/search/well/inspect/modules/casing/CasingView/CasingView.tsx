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

import EmptyState from 'components/emptyState';
import { useDeepMemo } from 'hooks/useDeep';
import { convertToPreviewData } from 'modules/wellSearch/utils/casings';
import { FlexColumn } from 'styles/layout';

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
import DepthColumn from './DepthColumn';
import DepthIndicator from './DepthIndicator/DepthIndicator';
import {
  BodyWrapper,
  DepthIndicatorGutter,
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
import { CasingViewTypeProps } from './interfaces';
import NdsEventsColumn from './NdsEventsColumn';
import NptEventsColumn from './NptEventsColumn';
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
    () =>
      nptEvents.filter(
        (nptEvent) =>
          nptEvent.measuredDepth &&
          nptEvent.measuredDepth.value >= minDepth &&
          nptEvent.measuredDepth.value <= maxDepth
      ),
    [minDepth, maxDepth, nptEvents]
  );

  const validNdsEvents = useMemo(
    () =>
      ndsEvents.filter(
        (ndsEvent) =>
          ndsEvent.metadata &&
          ndsEvent.metadata.md_hole_start &&
          Number(ndsEvent.metadata.md_hole_start) >= minDepth &&
          Number(ndsEvent.metadata.md_hole_start) <= maxDepth
      ),
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

              <NptEventsColumn
                scaleBlocks={scaleBlocks}
                events={validNptEvents}
                isEventsLoading={isNptEventsLoading}
              />
              <NdsEventsColumn
                scaleBlocks={scaleBlocks}
                events={validNdsEvents}
                isEventsLoading={isNdsEventsLoading}
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
