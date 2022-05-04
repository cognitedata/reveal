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
import { Tooltip } from 'components/PopperTooltip';
import { DepthMeasurementUnit } from 'constants/units';
import { useDeepMemo } from 'hooks/useDeep';
import { convertToPreviewData } from 'modules/wellSearch/utils/casings';
import { FlexColumn } from 'styles/layout';

import { SCALE_BLOCK_HEIGHT } from '../../common/Events/constants';
import DepthColumn from '../../common/Events/DepthColumn';
import {
  ScaleLine,
  DepthMeasurementScale,
  BodyWrapper,
  BodyColumn,
  BodyColumnHeaderWrapper,
  BodyColumnMainHeader,
  BodyColumnBody,
  BodyColumnHeaderLegend,
  LegendIndicator,
} from '../../common/Events/elements';
import EventsByDepth from '../../common/Events/EventsByDepth';
import { filterNdsByDepth, filterNptByDepth } from '../../common/Events/utils';
import { SelectedWellboreNptView } from '../../events/Npt/graph';
import { SelectedWellbore } from '../../events/Npt/graph/types';
import { SIDE_MODES } from '../constants';
import { getScale, getScaleBlocks } from '../helper';

import {
  NPT_EVENT_DETAILS_LABEL,
  NDS_EVENT_DETAILS_LABEL,
  EMPTY_STATE_TEXT,
  EMPTY_SCHEMA_TEXT,
  LOADING_TEXT,
  RKB_COLOR,
  SEA_LEVEL_COLOR,
  MUD_LINE_COLOR,
  RKB_LEVEL_LABEL,
  WATER_DEPTH_LABEL,
  DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT,
} from './constants';
import DepthIndicator from './DepthIndicator/DepthIndicator';
import {
  Wrapper,
  Header,
  MainHeader,
  SubHeader,
  EmptyCasingsStateWrapper,
  DepthIndicatorsContainer,
  SchemaTopContent,
  SchemaContent,
  RkbLevel,
  WaterDepth,
  DepthLabel,
  DepthIndicatorGutter,
} from './elements';
import { CasingViewTypeProps } from './interfaces';
import { getMdRange, isTied, mirrorCasingData } from './utils';

const MIN_SCALE_HEIGHT = 16;

/**
 * This component is used to generate casings diagram
 */
const CasingView: FC<CasingViewTypeProps> = ({
  casings,
  wellName,
  wellboreName,
  waterDepth,
  rkbLevel,
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

  const scale = useDeepMemo(() => getScale(scaleBlocks), [scaleBlocks]);

  const casingsList = useDeepMemo(
    () => orderBy(casings, 'endDepth', 'desc'),
    [casings]
  );

  const normalizedCasings = useMemo(() => {
    const data = convertToPreviewData(casingsList, scaleBlocks);

    if (sideMode === SIDE_MODES.Both) {
      return mirrorCasingData(data);
    }

    // Side mode = one / fallback
    return data;
  }, [casingsList, scaleBlocks, sideMode]);

  const [minDepth, maxDepth] = getMdRange(casingsList, nptEvents, ndsEvents);

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
    setScaleBlocks(getScaleBlocks(height, maxDepth));
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

  const getDepthBlockHeight = (value: number) =>
    scale(value) * SCALE_BLOCK_HEIGHT;

  const rkbLevelBlockHeight = getDepthBlockHeight(rkbLevel);
  const waterDepthBlockHeight = getDepthBlockHeight(waterDepth);

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

                  <BodyColumnHeaderLegend>
                    <BodyColumnMainHeader>
                      <LegendIndicator color={RKB_COLOR} />
                      RKB
                    </BodyColumnMainHeader>
                    <BodyColumnMainHeader>
                      <LegendIndicator color={SEA_LEVEL_COLOR} />
                      Sea Level
                    </BodyColumnMainHeader>
                    <BodyColumnMainHeader>
                      <LegendIndicator color={MUD_LINE_COLOR} />
                      Mud Line
                    </BodyColumnMainHeader>
                  </BodyColumnHeaderLegend>
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

                  <SchemaContent>
                    <DepthIndicatorsContainer>
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
                    </DepthIndicatorsContainer>

                    {/**
                     * This top content is positioned absolute.
                     * It's rendered on top of `DepthIndicatorsContainer` to avoid z-index issues.
                     */}
                    <SchemaTopContent>
                      <Tooltip
                        followCursor
                        content={`${Math.round(
                          rkbLevel
                        )} (${unit}) - ${RKB_LEVEL_LABEL}`}
                        disabled={
                          rkbLevelBlockHeight > DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT
                        }
                      >
                        <RkbLevel
                          height={rkbLevelBlockHeight}
                          pointer={
                            rkbLevelBlockHeight <=
                            DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT
                          }
                        >
                          {rkbLevelBlockHeight >
                            DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT && (
                            <Tooltip
                              content={RKB_LEVEL_LABEL}
                              placement="right"
                            >
                              <DepthLabel>
                                {Math.round(rkbLevel)} ({unit})
                              </DepthLabel>
                            </Tooltip>
                          )}
                        </RkbLevel>
                      </Tooltip>

                      <Tooltip
                        followCursor
                        content={`${Math.round(
                          waterDepth
                        )} (${unit}) - ${WATER_DEPTH_LABEL}`}
                        disabled={
                          waterDepthBlockHeight >
                          DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT
                        }
                      >
                        <WaterDepth
                          height={waterDepthBlockHeight}
                          pointer={
                            waterDepthBlockHeight <=
                            DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT
                          }
                        >
                          {waterDepthBlockHeight >
                            DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT && (
                            <Tooltip
                              content={WATER_DEPTH_LABEL}
                              placement="right"
                            >
                              <DepthLabel>
                                {Math.round(waterDepth)} ({unit})
                              </DepthLabel>
                            </Tooltip>
                          )}
                        </WaterDepth>
                      </Tooltip>
                    </SchemaTopContent>
                  </SchemaContent>
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
