import isFunction from 'lodash/isFunction';
import {
  ReportHandler,
  getCLS,
  getFID,
  getLCP,
  getFCP,
  getTTFB,
} from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && isFunction(onPerfEntry)) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
