import {
  MutableRefObject,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { CogniteOrnate } from '@cognite/ornate';
import { CogniteClient, Timeseries } from '@cognite/sdk';
import { makeKonvaTimeSeries } from 'components/Blueprint/utils';
import Konva from 'konva';
import { TimeSeriesTag } from 'typings';

import TimeseriesTag, { TimeSeriesTagProps } from './TimeseriesTag';

type OrnateTimeSeriesTagProps = {
  timeSeriesTag: TimeSeriesTag;
  client: CogniteClient;
  ornateViewer: MutableRefObject<CogniteOrnate | undefined>;
  isMinimized?: boolean;
  onUpdate?: (nextTag: TimeSeriesTag) => void;
};

type Position = {
  x: number;
  y: number;
};

type KonvaObjects = {
  line: Konva.Line;
  tag: Konva.Shape;
  point: Konva.Circle;
};

const OrnateTimeSeriesTag = ({
  timeSeriesTag,
  ornateViewer,
  client,
  isMinimized = true,
  onUpdate,
  ...rest
}: Omit<TimeSeriesTagProps, 'timeseries' | 'attrs'> &
  OrnateTimeSeriesTagProps) => {
  const [isOpen, setOpen] = useState(false);
  const [tagPosition, setTagPosition] = useState<Position>({ x: 0, y: 0 });
  const [timeSeries, setTimeSeries] = useState<Timeseries>();
  const konvaObjects = useRef<KonvaObjects>();

  const onSavePosition = useCallback(
    (next: Partial<TimeSeriesTag>) => {
      if (onUpdate) {
        const nextTag = {
          ...timeSeriesTag,
          ...next,
        };
        onUpdate(nextTag);
      }
    },
    [timeSeriesTag]
  );

  const onSavePositionRef = useRef(onSavePosition);
  useEffect(() => {
    onSavePositionRef.current = onSavePosition;
  }, [onSavePosition]);

  const renderItem = async (timeSeriesTag: TimeSeriesTag) => {
    if (!ornateViewer.current) return;

    const timeSeries = await client.timeseries
      .retrieve([timeSeriesTag.timeSeriesReference])
      .then((ts) => ts[0]);

    setTimeSeries(timeSeries);

    konvaObjects.current = makeKonvaTimeSeries(
      timeSeriesTag,
      timeSeries,
      ornateViewer.current,
      setTagPosition
    );

    const { tag, point, line } = konvaObjects.current;
    ornateViewer.current?.topLayer.add(tag, point, line);

    minimize(isMinimized);

    point.on('click', () => {
      setOpen((prev) => !prev);
    });

    tag.on('dragend', (e) => {
      onSavePositionRef.current({
        tagPosition: {
          x: Math.round(e.currentTarget.x()),
          y: Math.round(e.currentTarget.y()),
        },
      });
    });

    point.on('dragend', (e) => {
      onSavePositionRef.current({
        pointerPosition: {
          x: Math.round(e.currentTarget.x()),
          y: Math.round(e.currentTarget.y()),
        },
      });
    });
  };

  const minimize = (minimize: boolean) => {
    if (!konvaObjects.current) return;
    if (minimize) {
      konvaObjects.current.line.hide();
      konvaObjects.current.point.width(64);
      konvaObjects.current.point.height(64);
      konvaObjects.current.point.opacity(0.4);
    } else {
      konvaObjects.current.line.show();
      konvaObjects.current.point.width(48);
      konvaObjects.current.point.height(48);
      konvaObjects.current.point.opacity(0.8);
    }
  };

  useEffect(() => {
    renderItem(timeSeriesTag);

    return () => {
      if (konvaObjects.current) {
        konvaObjects.current.tag.destroy();
        konvaObjects.current.point.destroy();
        konvaObjects.current.line.destroy();
      }
    };
  }, []);

  useEffect(() => {
    minimize(isMinimized && !isOpen);
  }, [isMinimized, isOpen]);

  useEffect(() => {
    if (konvaObjects.current) {
      konvaObjects.current.point.setAttr('fill', timeSeriesTag.color);
      konvaObjects.current.line.setAttr('stroke', timeSeriesTag.color);
    }
  }, [timeSeriesTag.color]);

  if (!timeSeries) {
    return <div />;
  }

  if (isMinimized && !isOpen) {
    return <div />;
  }
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        transform: `translate(${tagPosition.x}px, ${tagPosition.y}px)`,
      }}
    >
      <TimeseriesTag
        timeseries={timeSeries}
        client={client}
        attrs={timeSeriesTag}
        {...rest}
      />
    </div>
  );
};
export default OrnateTimeSeriesTag;
