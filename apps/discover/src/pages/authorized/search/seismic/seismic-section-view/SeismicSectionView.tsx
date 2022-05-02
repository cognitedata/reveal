import React, { useEffect, useMemo, useState } from 'react';

import flatten from 'lodash/flatten';
import get from 'lodash/get';
import isUndefined from 'lodash/isUndefined';
import max from 'lodash/max';
import min from 'lodash/min';

import { BlankModal } from 'components/Modal';
import { useSelectedFiles } from 'modules/seismicSearch/selectors';
import { seismicService } from 'modules/seismicSearch/service';
import { SurveyFile } from 'modules/seismicSearch/types';
import { FlexGrow } from 'styles/layout';

import { ColorSelector } from './color-selector/ColorSelector';
import {
  colors,
  DEFAULT_COLOR_SCALE_RANGE,
  DEFAULT_ZOOM_LEVEL,
  displayTypes,
} from './constants';
import { CursorModeSelector } from './cursor-mode-selector/CursorModeSelector';
import { DatasetSelector } from './dataset-selector/DatasetSelector';
import { DisplayTypeSelector } from './display-type-selector/DisplayTypeSelector';
import {
  SeismicHeaderWrapper,
  SeismicModalBodyWrapper,
  SeismicModalContentWrapper,
  SeismicSecondaryHeaderWrapper,
  VertSeperator,
} from './elements';
import { LinePositionSelector } from './line-position-selector/LinePositionSelector';
import { SeismicPreview } from './SeismicPreview';
import {
  FetchedSlices,
  LineRange,
  RangeMap,
  SeismicDisplayType,
  SliceData,
  Tuplet,
} from './types';
import {
  getBoundryRange,
  getMean,
  getRangeMap,
  getStandardDeviation,
} from './utils';
import { ZoomLevelSelector } from './zoom-level-selector/ZoomLevelSelector';

interface Props {
  onClose: () => void;
}

const modalStyle = {
  margin: '25px',
  height: 'calc(100% - 50px)',
  minWidth: 'calc(100% - 50px)',
};

export const SeismicSectionView: React.FC<Props> = ({ onClose }) => {
  const [selectedDatasets, setSelectedDatasets] = useState<SurveyFile[]>([]);
  const [selectedSlices, setSelectedSlices] = useState<SliceData[]>([]);
  const [fetchedSlices, setFetchedSlices] = useState<FetchedSlices>({});
  const [rangeMap, setRangeMap] = useState<RangeMap>();
  const [loading, setLoading] = useState<boolean>(false);
  const [displayType, setDisplayType] = useState<SeismicDisplayType>(
    displayTypes[0]
  );
  const [linePosition, setLinePosition] = useState<number>();
  const [colorScale, setColorScale] = useState<string>(colors[0].id);
  const [colorScaleRange, setColorScaleRange] = useState<Tuplet>(
    DEFAULT_COLOR_SCALE_RANGE
  );
  const [zoomLevel, setZoomLevel] = useState<number>(DEFAULT_ZOOM_LEVEL);
  const [cursorMode, setCursorMode] = useState<string>('info');

  const datasets = useSelectedFiles();

  const getSliceData = () => {
    if (!rangeMap || isUndefined(linePosition)) return;

    const slices: SliceData[] = [];

    setSelectedSlices([]);

    const fileIdsToFetch: string[] = [];

    // Set selected slice data if already fetched
    selectedDatasets.forEach((selectedDataset) => {
      const { fileId } = selectedDataset;
      const lineKey = `${displayType.id}-${linePosition}`;
      const sliceData = get(fetchedSlices[fileId], lineKey) as SliceData;

      if (sliceData) {
        slices.push(sliceData);
      } else {
        fileIdsToFetch.push(fileId);
      }
    });

    if (fileIdsToFetch.length === 0) {
      setSelectedSlices(slices);
      return;
    }

    // Start fetching slice data if not already fetched
    setLoading(true);

    const sliceFetcher = Promise.all(
      fileIdsToFetch.map(async (fileId) => {
        const range = rangeMap[fileId];
        const staticLine = {
          min: linePosition,
          max: linePosition,
        };
        const iline = displayType.id === 'iline' ? staticLine : range.iline;
        const xline = displayType.id === 'xline' ? staticLine : range.xline;

        const sliceList = await seismicService.getSliceByLine(
          fileId,
          iline,
          xline
        );
        return {
          fileId,
          sliceList,
        };
      })
    );

    // Arrange and set slice data in state
    sliceFetcher.then((responses) => {
      responses.forEach((response) => {
        const lineKey = `${displayType.id}-${linePosition}`;
        const traces = flatten(response.sliceList.map((row) => row.traceList));
        const mean = getMean(traces);
        const standardDeviation = getStandardDeviation(traces, mean);

        const slice: SliceData = {
          id: response.fileId,
          content: response.sliceList,
          min: min(traces) || 0,
          max: max(traces) || 0,
          mean,
          standardDeviation,
        };

        // Set fetched slice data against file id and slice key
        setFetchedSlices((row) => ({
          ...row,
          [response.fileId]: {
            ...row[response.fileId],
            [lineKey]: slice,
          },
        }));
        slices.push(slice);
        setSelectedSlices(slices);
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    setSelectedDatasets([datasets[0]]);
    getRangeMap(datasets).then((results) => {
      setRangeMap(results);
    });
  }, []);

  useEffect(() => {
    getSliceData();
  }, [rangeMap, linePosition, selectedDatasets]);

  const handleSelectDataset = (item: SurveyFile) => {
    setSelectedDatasets([item]);
  };

  // Get selected line range
  const lineRange = useMemo(() => {
    if (!rangeMap || selectedDatasets.length === 0) return undefined;
    const selectedRanges = selectedDatasets.map((dataset) =>
      get(rangeMap, dataset.fileId)
    );
    const boundryRange = getBoundryRange(selectedRanges as LineRange[]);
    return get(boundryRange, displayType.id);
  }, [selectedDatasets, rangeMap, displayType]);

  const selectedSliceAmplitudeRange: Tuplet = useMemo(() => {
    return selectedSlices.length > 0
      ? [selectedSlices[0].min, selectedSlices[0].max]
      : [0, 0];
  }, [selectedSlices]);

  return (
    <BlankModal style={modalStyle} visible onCancel={onClose}>
      <SeismicModalContentWrapper>
        {/* Top Header */}
        <SeismicHeaderWrapper>
          <h2>Seismic section view</h2>
          <FlexGrow />
          <VertSeperator />
        </SeismicHeaderWrapper>
        {/* Secondary Header */}
        <SeismicSecondaryHeaderWrapper>
          <DisplayTypeSelector
            selected={displayType}
            setDisplayType={setDisplayType}
          />
          <DatasetSelector
            datasets={datasets}
            selectedDatasets={selectedDatasets}
            handleSelect={handleSelectDataset}
          />
          {lineRange && (
            <LinePositionSelector
              lineType={displayType.title}
              lineRange={lineRange}
              onChange={setLinePosition}
            />
          )}
          <VertSeperator />
          <ZoomLevelSelector zoomLevel={zoomLevel} onChange={setZoomLevel} />
          <VertSeperator />
          <CursorModeSelector
            cursorMode={cursorMode}
            onChange={setCursorMode}
          />
          <VertSeperator />
          <ColorSelector
            setColorScale={setColorScale}
            setColorScaleRange={setColorScaleRange}
            amplitudeRange={selectedSliceAmplitudeRange}
          />
        </SeismicSecondaryHeaderWrapper>
        {/* Seismic Preview */}
        <SeismicModalBodyWrapper>
          <SeismicPreview
            isLoading={loading}
            colorScale={colorScale}
            colorScaleRange={colorScaleRange}
            zoomLevel={zoomLevel}
            slice={selectedSlices[0]}
            cursorMode={cursorMode}
            displayType={displayType}
            onZoomLevelChange={setZoomLevel}
          />
        </SeismicModalBodyWrapper>
      </SeismicModalContentWrapper>
    </BlankModal>
  );
};

export default SeismicSectionView;
