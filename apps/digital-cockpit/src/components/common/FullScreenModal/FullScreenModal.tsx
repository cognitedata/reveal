import { FileInfo, Timeseries } from '@cognite/sdk';
import DocumentGlobalView from 'components/explorer/DocumentGlobalView';
import TimeSeriesGlobalView from 'components/explorer/TimeSeriesGlobalView';
import StatusMessage from 'components/utils/StatusMessage';
import useFilesByIdQuery from 'hooks/useQuery/useFilesByIdQuery';
import useTimeSeriesByIdQuery from 'hooks/useQuery/useTimeSeriesByIdQuery';
import isNil from 'lodash/isNil';
import { useEffect, useState } from 'react';

import { FullScreenModalContainer } from './elements';

type Props = {
  visible: boolean;
  docId?: string | null;
  timeseriesId?: string | null;
  onCancel?: () => void;
};
const FullScreenModal = ({ visible, docId, timeseriesId, onCancel }: Props) => {
  const [isVisible, setIsVisible] = useState(visible);

  const {
    data: timeseries,
    isSuccess: isTimeSeriesSuccess,
    isLoading: isTimeSeriesLoading,
    error: isTimeSeriesError,
  } = useTimeSeriesByIdQuery(
    timeseriesId ? [{ id: +timeseriesId }] : undefined
  );
  const {
    data: files,
    isSuccess: isFilesSuccess,
    isLoading: isFilesLoading,
    error: isFilesError,
  } = useFilesByIdQuery(docId ? [{ id: +docId }] : undefined);

  useEffect(() => {
    if (!visible) {
      setIsVisible(false);
    } else if (visible && (isTimeSeriesSuccess || isFilesSuccess)) {
      setIsVisible(true);
    }
  }, [visible, isTimeSeriesSuccess, isFilesSuccess]);

  const getTitle = (): string | undefined => {
    if (isTimeSeriesSuccess && !isNil(timeseries![0])) {
      return timeseries![0].name;
    }
    if (isFilesSuccess && !isNil(files![0])) {
      return files![0].name;
    }
    return 'No data';
  };

  const renderContent = () => {
    if (isTimeSeriesLoading || isFilesLoading) {
      return <StatusMessage type="Loading" />;
    }
    if (isTimeSeriesError || isFilesError) {
      return <StatusMessage type="Error" />;
    }
    if (isTimeSeriesSuccess && !isNil(timeseries![0])) {
      return <TimeSeriesGlobalView timeSeries={timeseries![0] as Timeseries} />;
    }
    if (isFilesSuccess && !isNil(files![0])) {
      return <DocumentGlobalView document={files![0] as FileInfo} />;
    }
    return null;
  };

  return (
    <FullScreenModalContainer
      visible={isVisible}
      title={getTitle()}
      onCancel={onCancel}
      footer={null}
      width={1320}
      closable
    >
      {renderContent()}
    </FullScreenModalContainer>
  );
};

export default FullScreenModal;
