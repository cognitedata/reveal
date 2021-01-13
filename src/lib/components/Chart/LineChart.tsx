import React, { useMemo, useCallback } from 'react';
import { AreaClosed, Line, Bar, LinePath } from '@visx/shape';
import { GridRows, GridColumns } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
import {
  useTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles,
} from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { max, min, extent, bisector } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import { DatapointAggregate } from '@cognite/sdk';
import { AxisRight, AxisBottom } from '@visx/axis';
import { Group } from '@visx/group';
import { Threshold } from '@visx/threshold';
import { Body, Colors, Overline } from '@cognite/cogs.js';
import { lightGrey } from 'lib/utils/Colors';

const pointColor = Colors['midblue-3'].hex();
const primaryColor = Colors['midblue-4'].hex();
const primaryColor2 = Colors['midblue-6'].hex();
const areaColor = Colors['midblue-5'].hex();
const tooltipStyles = {
  ...defaultStyles,
  background: 'white',
  border: 'none',
  color: 'white',
};

// util
const formatDate = timeFormat('%b %d %Y, %H:%m');

// accessors
const getDate = (d?: DatapointAggregate) =>
  d ? new Date(d.timestamp) : new Date(0);
const getDataPointValue = (d?: DatapointAggregate) =>
  d ? d.average : undefined;
const getDataPointMaxValue = (d?: DatapointAggregate) =>
  d ? d.max : undefined;
const getDataPointMinValue = (d?: DatapointAggregate) =>
  d ? d.min : undefined;
const bisectDate = bisector<DatapointAggregate, Date>(
  d => new Date(d.timestamp)
).left;

export type LineChartProps = {
  width: number;
  height: number;
  minRowTicks?: number;
  domain?: [Date, Date];
  showGridLine?: 'both' | 'horizontal' | 'vertical' | 'none';
  showAxis?: 'both' | 'horizontal' | 'vertical' | 'none';
  enableTooltip?: boolean;
  showPoints?: boolean;
  enableArea?: boolean;
  enableMinMaxArea?: boolean;
  values: DatapointAggregate[];
  margin?: { top: number; right: number; bottom: number; left: number };
};

export const LineChart = ({
  values,
  width,
  height,
  domain,
  showGridLine = 'horizontal',
  showAxis = 'both',
  enableArea = false,
  enableMinMaxArea = true,
  enableTooltip = true,
  showPoints = true,
  minRowTicks = 5,
  margin = { top: 0, right: 40, bottom: 40, left: 0 },
}: LineChartProps) => {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<DatapointAggregate>();
  // bounds
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [0, innerWidth],
        domain: domain || (extent(values, getDate) as [Date, Date]),
      }),
    [innerWidth, values, domain]
  );
  const valuesScale = useMemo(() => {
    const minValues = values
      .map(getDataPointMinValue)
      .filter(el => el !== undefined) as number[];
    const maxValues = values
      .map(getDataPointMaxValue)
      .filter(el => el !== undefined) as number[];
    return scaleLinear({
      range: [innerHeight, 0],
      domain: [min(minValues) || 0, max(maxValues) || 1],
      nice: true,
    });
  }, [innerHeight, values]);

  // tooltip handler
  const handleTooltip = useCallback(
    (
      event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>
    ) => {
      const { x } = localPoint(event) || { x: 0 };
      const translatedX = x - margin.left;
      const x0 = dateScale.invert(translatedX);
      const index = bisectDate(values, x0, 1);
      const d0 = values[index - 1];
      const d1 = values[index];
      let d: DatapointAggregate | undefined = d0;
      if (d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }

      const value = getDataPointValue(d);
      showTooltip({
        tooltipData: d,
        tooltipLeft: translatedX,
        tooltipTop: d && value !== undefined ? valuesScale(value) : 0,
      });
    },
    [margin.left, values, showTooltip, valuesScale, dateScale]
  );

  const numRowTicks = Math.max(minRowTicks, Math.floor(height / 30));
  const numColumnTicks = Math.max(5, Math.floor(width / 100));
  const getXWithScale = (d: DatapointAggregate) => {
    return dateScale(getDate(d));
  };

  const renderGrid = () => {
    return (
      <>
        {(showGridLine === 'both' || showGridLine === 'horizontal') && (
          <GridRows
            scale={valuesScale}
            width={innerWidth}
            height={innerHeight}
            numTicks={numColumnTicks}
            strokeDasharray="1,3"
            stroke={lightGrey}
            strokeWidth="1.3"
          />
        )}
        {(showGridLine === 'both' || showGridLine === 'vertical') && (
          <GridColumns
            scale={dateScale}
            width={innerWidth}
            height={innerHeight}
            numTicks={numRowTicks}
            stroke={lightGrey}
            strokeWidth="1.3"
          />
        )}
      </>
    );
  };
  const renderAxis = () => {
    return (
      <>
        {(showAxis === 'both' || showAxis === 'horizontal') && (
          <AxisBottom
            top={innerHeight}
            scale={dateScale}
            numTicks={numColumnTicks}
            tickStroke={lightGrey}
            strokeWidth={0}
            tickLabelProps={() => ({
              fontFamily: 'Inter',
              fontSize: 12,
              fill: Colors['greyscale-grey6'].hex(),
              textAnchor: 'middle',
            })}
          />
        )}
        {(showAxis === 'both' || showAxis === 'vertical') && (
          <AxisRight
            scale={valuesScale}
            left={innerWidth}
            numTicks={numRowTicks}
            tickStroke={lightGrey}
            strokeWidth={0}
            tickLabelProps={() => ({
              fontFamily: 'Inter',
              fontSize: 12,
              dy: 5,
              dx: 8,
              fill: Colors['greyscale-grey6'].hex(),
              textAnchor: 'start',
            })}
          />
        )}
      </>
    );
  };
  const renderableValues = values.filter(el => {
    const data = getDataPointValue(el);
    if (data !== undefined) {
      return valuesScale(data) !== undefined;
    }
    return false;
  });

  const renderArea = () => {
    if (!enableArea) {
      return <></>;
    }
    return (
      <AreaClosed<DatapointAggregate>
        data={renderableValues}
        width={innerWidth}
        height={innerHeight}
        x={d => getXWithScale(d)!}
        y1={d => {
          return valuesScale(getDataPointValue(d)!)!;
        }}
        y0={0}
        yScale={valuesScale}
        strokeWidth={0}
        stroke="url(#area-gradient)"
        fill="url(#area-gradient)"
      />
    );
  };
  const renderLine = () => {
    return (
      <LinePath<DatapointAggregate>
        data={renderableValues}
        width={innerWidth}
        height={innerHeight}
        x={d => getXWithScale(d)!}
        y={d => {
          return valuesScale(getDataPointValue(d)!)!;
        }}
        strokeWidth={2}
        stroke={primaryColor}
      />
    );
  };
  const renderThreshold = () => {
    if (!enableMinMaxArea) {
      return <></>;
    }
    const renderableMinMaxValues = values.filter(el => {
      const minVal = getDataPointMinValue(el);
      const maxVal = getDataPointMaxValue(el);
      if (minVal !== undefined && maxVal !== undefined) {
        return (
          valuesScale(minVal) !== undefined && valuesScale(maxVal) !== undefined
        );
      }
      return false;
    });
    return (
      <Threshold<DatapointAggregate>
        id={`${Math.random()}`}
        data={renderableMinMaxValues}
        x={d => getXWithScale(d)!}
        y0={d => {
          return valuesScale(getDataPointMinValue(d)!)!;
        }}
        y1={d => {
          return valuesScale(getDataPointMaxValue(d)!)!;
        }}
        clipAboveTo={0}
        clipBelowTo={innerHeight}
        belowAreaProps={{
          fill: areaColor,
          fillOpacity: 0.4,
        }}
        aboveAreaProps={{
          fill: areaColor,
          fillOpacity: 0.4,
        }}
      />
    );
  };

  const renderPoints = () => {
    if (!showPoints) {
      return <></>;
    }
    return (
      <Group>
        {values.map(d => {
          const value = getDataPointValue(d);
          const cy = d && value !== undefined ? valuesScale(value) : 0;
          return (
            <circle
              key={d.timestamp.valueOf()}
              r={2}
              cx={getXWithScale(d)}
              cy={cy}
              fill={pointColor}
            />
          );
        })}
      </Group>
    );
  };

  const renderTooltipLine = () => {
    if (!enableTooltip) {
      return <></>;
    }
    return (
      <>
        <Bar
          width={innerWidth}
          height={innerHeight}
          fill="transparent"
          rx={14}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={() => hideTooltip()}
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: 0 }}
              to={{ x: tooltipLeft, y: innerHeight + 0 }}
              stroke={primaryColor2}
              strokeWidth={2}
              pointerEvents="none"
              strokeDasharray="5,2"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill={primaryColor2}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
      </>
    );
  };

  const renderTooltipContent = () => {
    if (!enableTooltip) {
      return <></>;
    }
    return (
      tooltipData && (
        <div>
          <TooltipWithBounds
            key={Math.random()}
            top={tooltipTop - 90}
            left={tooltipLeft + 12}
            style={tooltipStyles}
          >
            <>
              <Overline level={3}>Value</Overline>
              <Body level={3}>{getDataPointValue(tooltipData)}</Body>
              <Overline level={3}>Max</Overline>
              <Body level={3}>{getDataPointMaxValue(tooltipData)}</Body>
              <Overline level={3}>Min</Overline>
              <Body level={3}>{getDataPointMinValue(tooltipData)}</Body>
            </>
          </TooltipWithBounds>
          <Tooltip
            top={innerHeight + margin.top - 14}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              minWidth: 72,
              textAlign: 'center',
              transform: 'translateX(-50%)',
            }}
          >
            {formatDate(getDate(tooltipData))}
          </Tooltip>
        </div>
      )
    );
  };
  return (
    <div>
      <svg
        width={width}
        height={height}
        style={{
          overflow: 'visible',
        }}
      >
        <Group
          left={margin.left}
          top={margin.top}
          style={{
            transform: 'translate(10px, 10px)',
          }}
        >
          <LinearGradient
            id="area-gradient"
            from={primaryColor}
            to={primaryColor}
            toOpacity={0.1}
          />
          {renderGrid()}
          {renderAxis()}
          {renderArea()}
          {renderLine()}
          {renderThreshold()}
          {renderPoints()}
          {renderTooltipLine()}
        </Group>
      </svg>
      {renderTooltipContent()}
    </div>
  );
};
