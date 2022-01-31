import head from 'lodash/head';
import intersection from 'lodash/intersection';
import sortBy from 'lodash/sortBy';
import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';
import { log } from 'utils/log';

import { Sequence } from '@cognite/sdk';

import { TRACK_CONFIG } from 'modules/wellSearch/constants';
import { SequenceData, SequenceRow } from 'modules/wellSearch/types';

const LOG_COLOMNS = TRACK_CONFIG.filter(
  (track) => track.type === 'DepthLogs'
).map((track) => track.column);

const LOG_FRM_TOPS_COLOMNS = TRACK_CONFIG.filter(
  (track) => track.type === 'FormationTops'
).map((track) => track.column);

const ROW_LIMIT_PER_REQ = 1000;

const BINARY_SEARCH_START = 0;
const BINARY_SEARCH_END = 2000000;
const MIN_SEARCH_RANGE = 1000;
const ORPHAN_SEARCH_RANGE = 2000;

export const getRowData = async (logs: Sequence[], logsFrmTops: Sequence[]) => {
  return Promise.all([
    Promise.all(logs.map((log) => startLogRowDataFetch(log))),
    Promise.all(logsFrmTops.map((log) => startLogFrmTopsRowDataFetch(log))),
  ])
    .then((data) => {
      if (data) {
        return {
          logs: head(data) || [],
          logsFrmTops: data.length > 1 ? data[1] : [],
        };
      }
      return {
        logs: [],
        logsFrmTops: [],
      };
    })
    .catch(() => {
      return {
        logs: logs.map((log) => ({ log, rows: [] })),
        logsFrmTops: logsFrmTops.map((log) => ({ log, rows: [] })),
      };
    });
};

// This is used to start row data fetching for single log
export const startLogRowDataFetch = async (
  sequence: Sequence
): Promise<SequenceData> => {
  const logColumns = getLogColumns(sequence);

  if (
    logColumns.length === 0 ||
    (logColumns.length === 1 && logColumns[0] === 'DEPT')
  ) {
    return new Promise((resolve) => {
      resolve({ sequence, rows: [] });
    });
  }

  // Get row data margins based on metadata start depth and end depth
  const { startMargin, endMargin } = getRowDataMargins(sequence);

  // This will update with searched valued rows in start and end search
  const searchedValuedRowsSets: SequenceRow[][] = [];

  // This finds start margin with not null values
  let valuedStartMargin = await findValuedStartMargin(
    startMargin,
    endMargin,
    sequence.id,
    logColumns,
    searchedValuedRowsSets
  );

  // This finds end margin with not null values
  let valuedEndMargin = await findValuedEndMargin(
    valuedStartMargin || startMargin,
    endMargin,
    sequence.id,
    logColumns,
    searchedValuedRowsSets
  );

  /**
   * If start margin not found in binary search but end margin is found,
   * then do a binary search again to find the start margin with the new end margin.
   */
  if (!valuedStartMargin && valuedStartMargin !== 0 && valuedEndMargin) {
    valuedStartMargin = await findValuedStartMargin(
      startMargin,
      valuedEndMargin,
      sequence.id,
      logColumns,
      searchedValuedRowsSets
    );
  }

  if (!valuedStartMargin && valuedStartMargin !== 0) {
    valuedStartMargin = startMargin;
  }
  if (!valuedEndMargin && valuedEndMargin !== 0) {
    valuedEndMargin = valuedStartMargin + ORPHAN_SEARCH_RANGE;
  }

  // This sorts already fetched row data sets in binary search
  const sortedValuedRowsSets = sortBy(
    searchedValuedRowsSets,
    (searchedValuedRowsSet) => searchedValuedRowsSet[0].rowNumber
  );

  let sortedValuedRows: SequenceRow[] = [];
  sortedValuedRows = sortedValuedRows.concat(...sortedValuedRowsSets);

  // This gets request slots for parallel search
  const requestSlots = getRequestSets(
    sortedValuedRowsSets,
    valuedStartMargin,
    valuedEndMargin
  );

  // Fetch row data parallelly
  // eslint-disable-next-line consistent-return
  return Promise.all(
    requestSlots.map((requestSlot) =>
      parallelDataFetcher(
        sequence.id,
        requestSlot[0],
        requestSlot[1],
        logColumns
      )
    )
  )
    .then((parallelDataSets) => {
      let parallelData: SequenceRow[] = [...sortedValuedRows];
      parallelData = parallelData.concat(...parallelDataSets);
      return { sequence, rows: sortBy(parallelData, 'rowNumber') };
    })
    .catch(() => ({ sequence, rows: [] }));
};

// This is used to start row data fetching for single log
export const startLogFrmTopsRowDataFetch = async (
  sequence: Sequence
): Promise<SequenceData> => {
  const logColumns = getLogFrmTopsColumns(sequence);

  if (
    logColumns.length === 0 ||
    (logColumns.length === 1 && logColumns[0] === 'MD')
  ) {
    return new Promise((resolve) => {
      resolve({ sequence, rows: [] });
    });
  }

  // Get row data margins based on metadata start depth and end depth
  // const { startMargin, endMargin } = getRowDataMargins(log);
  const { startMargin, endMargin } = { startMargin: 0, endMargin: undefined };

  // This will update with searched valued rows in start and end search
  const searchedValuedRowsSets: SequenceRow[][] = [];

  // This finds start margin with not null values
  await queryFrmTopsAll(
    startMargin,
    endMargin,
    sequence.id,
    logColumns,
    searchedValuedRowsSets
  );

  if (searchedValuedRowsSets.length === 0) {
    return new Promise((resolve) => {
      resolve({ sequence, rows: [] });
    });
  }

  // This sorts already fetched row data sets in binary search
  const sortedValuedRowsSets = sortBy(
    searchedValuedRowsSets,
    (searchedValuedRowsSet) => searchedValuedRowsSet[0].rowNumber
  );

  let sortedValuedRows: SequenceRow[] = [];
  sortedValuedRows = sortedValuedRows.concat(...sortedValuedRowsSets);

  return new Promise((resolve) => {
    resolve({ sequence, rows: sortedValuedRows });
  });
};

// This returns available required columns in the log
const getLogColumns = (log: Sequence) => {
  // This finds available required columns in the log
  const logColumns = intersection(
    log.columns.map((column) => column.name),
    LOG_COLOMNS
  );
  return logColumns as string[];
};

// This returns available required columns in the log formation tops
const getLogFrmTopsColumns = (log: Sequence) => {
  // This finds available required columns in the log formation tops
  const logColumns = intersection(
    log.columns.map((column) => column.name),
    LOG_FRM_TOPS_COLOMNS
  );
  return logColumns as string[];
};

// This returns row data margins based in start depth and end depth
const getRowDataMargins = (log: Sequence) => {
  const defaultMargins = {
    startMargin: BINARY_SEARCH_START,
    endMargin: BINARY_SEARCH_END,
  };
  if (!log.metadata) return defaultMargins;
  const { startDepth, endDepth, step } = log.metadata;
  if (
    !Number.isNaN(Number(startDepth)) &&
    !Number.isNaN(Number(endDepth)) &&
    !Number.isNaN(Number(step))
  ) {
    const endMargin = Math.ceil(
      (Number(endDepth) - Number(startDepth)) / Number(step)
    );
    return { startMargin: BINARY_SEARCH_START, endMargin };
  }
  return defaultMargins;
};

/**
 *
 * This is used to find top margin with valued row.
 * Initially this finds top margin in first data set.
 * If top margin is not found, it will do a binary search to find the top margin
 */
const findValuedStartMargin = async (
  startMargin: number,
  endMargin: number,
  logId: number,
  logColumns: string[],
  searchedValuedRows: SequenceRow[][]
) => {
  try {
    const rowData = await rowDataFetcher(
      logId,
      startMargin,
      MIN_SEARCH_RANGE,
      logColumns
    );

    if (rowData.length === 0) return;

    const rows = filterValuedRows(rowData);

    if (rows.length > 0) {
      // Top margin found in initial data set
      searchedValuedRows.push(rows);
      // eslint-disable-next-line consistent-return
      return rows[0].rowNumber;
    }
    // Do a binary search to find the top margin
    // eslint-disable-next-line consistent-return
    return await binarySearchForStart(
      logId,
      startMargin + MIN_SEARCH_RANGE,
      endMargin,
      logColumns,
      searchedValuedRows
    );
  } catch (error) {
    log('error', String(error));
  }
};

/**
 *
 * This is used to find end margin with valued row.
 * Initially this finds end margin in last data set.
 * If end margin is not found, it will do a binary search to find the end margin
 */
const findValuedEndMargin = async (
  startMargin: number,
  endMargin: number,
  logId: number,
  logColumns: string[],
  searchedValuedRows: SequenceRow[][]
) => {
  try {
    const rowData = await rowDataFetcher(
      logId,
      endMargin - MIN_SEARCH_RANGE,
      endMargin,
      logColumns
    );

    if (rowData.length === 0) return;

    const rows = filterValuedRows(rowData);

    if (rows.length > 0) {
      // End margin found in initial data set
      searchedValuedRows.push(rows);
      // eslint-disable-next-line consistent-return
      return rows[rows.length - 1].rowNumber;
    }
    // Do a binary search to find the end margin
    // eslint-disable-next-line consistent-return
    return await binarySearchForEnd(
      logId,
      startMargin,
      endMargin - MIN_SEARCH_RANGE,
      logColumns,
      searchedValuedRows
    );
  } catch (error) {
    log('error', error as string);
  }
};

// This returns only rows which has values
const filterValuedRows = (rowData: SequenceRow[]) => {
  return rowData.filter(
    (row) => row.filter((value) => value === 0 || value).length >= 2
  );
};

// This binary search is used to find top margin with valued row
const binarySearchForStart = async (
  logId: number,
  start: number,
  end: number,
  columns: string[],
  searchedValuedRows: SequenceRow[][]
) => {
  let finalSearch = false;
  // If the search range is less than Minimum search range, this will consider as the final search
  if (start + MIN_SEARCH_RANGE > end) {
    finalSearch = true;
  }
  const newEnd = finalSearch ? end : Math.ceil((start + end) / 2);
  const newStart = finalSearch ? start : newEnd - MIN_SEARCH_RANGE;
  const rowData = await rowDataFetcher(logId, newStart, newEnd, columns);
  const rows = filterValuedRows(rowData);

  if (rows.length > 0) searchedValuedRows.push(rows);

  if (finalSearch) {
    if (rows.length > 0) {
      return rows[0].rowNumber;
    }
  } else if (rows.length === rowData.length) {
    // Do binary search again in left
    const rowNumber: any = await binarySearchForStart(
      logId,
      start,
      newStart,
      columns,
      searchedValuedRows
    );
    return rowNumber;
  } else if (rows.length === 0) {
    // Do binary search again in right
    const rowNumber: any = await binarySearchForStart(
      logId,
      newEnd,
      end,
      columns,
      searchedValuedRows
    );
    return rowNumber;
  } else {
    return rows[0].rowNumber;
  }
  return undefined;
};

// This binary search is used to find end margin with valued row
const binarySearchForEnd = async (
  logId: number,
  start: number,
  end: number,
  columns: string[],
  searchedValuedRows: SequenceRow[][]
) => {
  let finalSearch = false;
  // If the search range is less than Minimum search range, this will consider as the final search
  if (start + MIN_SEARCH_RANGE > end) {
    finalSearch = true;
  }
  const newStart = finalSearch ? start : Math.ceil((start + end) / 2);
  const newEnd = finalSearch ? end : newStart + MIN_SEARCH_RANGE;
  const rowData = await rowDataFetcher(logId, newStart, newEnd, columns);
  const rows = filterValuedRows(rowData);

  if (rows.length > 0) searchedValuedRows.push(rows);

  if (finalSearch) {
    if (rows.length > 0) {
      return rows[rows.length - 1].rowNumber;
    }
  } else if (rows.length === rowData.length) {
    // Do binary search again in right
    const rowNumber: any = await binarySearchForEnd(
      logId,
      newEnd,
      end,
      columns,
      searchedValuedRows
    );
    return rowNumber;
  } else if (rows.length === 0) {
    // Do binary search again in left
    const rowNumber: any = await binarySearchForEnd(
      logId,
      start,
      newStart,
      columns,
      searchedValuedRows
    );
    return rowNumber;
  } else {
    return rows[rows.length - 1].rowNumber;
  }
  return undefined;
};

/**
 * This is used to generate request sets with start and end values for parallel search.
 * Already fetched data ranges will be ommited here.
 * @param sortedValuedRowsSets
 *    - This contains sets of row data already fetched while searching for start and end margin.
 *    - Sets are ordered by row numbers
 */
const getRequestSets = (
  sortedValuedRowsSets: SequenceRow[][],
  valuedStartMargin: number,
  valuedEndMargin: number
) => {
  const missingSets = [];

  // This updates misingSet array with missing data ranges based on already fetched row data
  if (sortedValuedRowsSets.length > 0) {
    for (let i = 0; i < sortedValuedRowsSets.length - 1; i++) {
      const currentSet = sortedValuedRowsSets[i];
      const nextSet = sortedValuedRowsSets[i + 1];
      const missingSet = [
        currentSet[currentSet.length - 1].rowNumber + 1,
        nextSet[0].rowNumber - 1,
      ];
      if (missingSet[0] < missingSet[1]) {
        missingSets.push(missingSet);
      }
    }
  } else {
    missingSets.push([valuedStartMargin, valuedEndMargin]);
  }

  // This devides missing sets in to smaller pieces(ROW_LIMIT_PER_REQ) and return to do parallel search
  const requestSlots: number[][] = [];
  missingSets.forEach((slot) => {
    if (slot[1] - slot[0] <= ROW_LIMIT_PER_REQ) {
      requestSlots.push(slot);
    } else {
      let requestSlot = [];
      for (let i = slot[0]; i <= slot[1]; i++) {
        if (requestSlot.length === 0) {
          requestSlot.push(i);
        } else if (
          requestSlot.length === 1 &&
          (i === slot[1] || i - requestSlot[0] === ROW_LIMIT_PER_REQ)
        ) {
          requestSlot.push(i);
        }
        if (requestSlot.length === 2) {
          requestSlots.push(requestSlot);
          requestSlot = [];
        }
      }
    }
  });

  return requestSlots;
};

// This is used as generator function in parallel data fetching
const parallelDataFetcher = async (
  logId: number,
  start: number,
  end: number,
  logColumns: string[]
) => {
  try {
    const rowData = await rowDataFetcher(logId, start, end, logColumns);
    return rowData;
  } catch (error) {
    return [];
  }
};

/**
 *
 * This just queries for all Formation Tops because
 * We don't know an 'endtime'
 */
const queryFrmTopsAll = async (
  start: number,
  end: number | undefined,
  logId: number,
  logColumns: string[],
  searchedValuedRows: SequenceRow[][]
) => {
  try {
    const rowData = await rowDataFetcher(logId, start, end, logColumns);
    if (rowData.length === 0) return;

    const rows = filterValuedRows(rowData);

    if (rows.length > 0) {
      searchedValuedRows.push(rows);
    }
  } catch (error) {
    log('error', String(error));
  }
};

// Row data fetcher with multiple tryings
const rowDataFetcher = async (
  id: number,
  start: number,
  end: number | undefined,
  columns: string[],
  limit?: number
) => {
  const res = await getCogniteSDKClient()
    .sequences.retrieveRows({
      id,
      start,
      end,
      columns,
      limit: ROW_LIMIT_PER_REQ,
    })
    .autoPagingToArray({ limit: limit || Infinity });
  return res;
};

export function getLogsDataByLogs(logs: Sequence[], logsFrmTops: Sequence[]) {
  return getRowData(logs, logsFrmTops);
}
