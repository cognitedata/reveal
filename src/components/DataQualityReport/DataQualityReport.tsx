import { Button, Modal } from '@cognite/cogs.js';
import noop from 'lodash/noop';
import React, { useEffect, useState } from 'react';

type DataQualityReportProps = {
  timeSeriesId?: string;
  reportType?: string;
  handleClose: () => void;
};

type GapReport = {
  averageInterval: number;
  meanInterval: number;
  standardDeviation: number;
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
        averageInterval: 1.2345343213435,
        meanInterval: 1.345676756454,
        standardDeviation: 0.675645342325,
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
        title="Gap Analysis Report"
      >
        {isLoading ? (
          <div>Please wait&hellip;</div>
        ) : (
          <>
            <h3>Key info:</h3>
            <p>
              <strong>Average interval:</strong>{' '}
              {dataQualityReport?.averageInterval}
            </p>
            <p>
              <strong>Mean interval:</strong> {dataQualityReport?.meanInterval}
            </p>
            <p>
              <strong>Standard deviation:</strong>{' '}
              {dataQualityReport?.standardDeviation}
            </p>
          </>
        )}
      </Modal>
    </>
  );
};

export default DataQualityReport;
