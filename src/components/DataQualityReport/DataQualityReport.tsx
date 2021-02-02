import { Button, Modal } from '@cognite/cogs.js';
import noop from 'lodash/noop';
import React, { useEffect, useState } from 'react';
import gapChart from 'assets/gaps.png';

type DataQualityReportProps = {
  timeSeriesId?: string;
  reportType?: string;
  handleClose: () => void;
};

type GapReport = {
  averageSamplingPeriod: number;
  meanSamplingPeriod: number;
  medianSamplingPeriod: number;
  standardDeviation: number;
  min: number;
  max: number;
};

const DataQualityReport = ({
  timeSeriesId,
  reportType,
  handleClose = noop,
}: DataQualityReportProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataQualityReport, setDataQualityReport] = useState<GapReport>();

  useEffect(() => {
    async function performQuery() {
      setIsLoading(true);

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      const reportData = {
        averageSamplingPeriod: 1.02745657864329,
        meanSamplingPeriod: 1.027567564534232,
        medianSamplingPeriod: 1.027867564543234,
        standardDeviation: 0.963245676764534,
        min: 1.0,
        max: 50.0,
      };

      setDataQualityReport(reportData);
      setIsLoading(false);
    }

    performQuery();
  }, [timeSeriesId, reportType]);

  const showModal = !!(timeSeriesId && reportType);

  return (
    <>
      <Modal
        visible={showModal}
        width={900}
        onCancel={handleClose}
        footer={
          <div className="cogs-modal-footer-buttons">
            <Button type="primary" onClick={handleClose}>
              Close
            </Button>
          </div>
        }
        title={`Gap Analysis Report - ${timeSeriesId || ''}`}
      >
        {isLoading ? (
          <div>Please wait&hellip;</div>
        ) : (
          <>
            <p>
              <strong>Average sampling period:</strong>{' '}
              {dataQualityReport?.averageSamplingPeriod}
            </p>
            <p>
              <strong>Mean sampling period:</strong>{' '}
              {dataQualityReport?.meanSamplingPeriod}
            </p>
            <p>
              <strong>Median sampling period:</strong>{' '}
              {dataQualityReport?.medianSamplingPeriod}
            </p>
            <p>
              <strong>Standard deviation:</strong>{' '}
              {dataQualityReport?.standardDeviation}
            </p>
            <p>
              <strong>Minimum:</strong> {dataQualityReport?.min}
            </p>
            <p>
              <strong>Maximum:</strong> {dataQualityReport?.max}
            </p>
            <div>
              <img alt="gap chart" src={gapChart} style={{ width: '100%' }} />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default DataQualityReport;
