import { utils, WorkBook, writeFile } from 'xlsx';

import { Timestamp } from '@cognite/sdk/dist/src';

type ReportFormat = {
  endTime: Timestamp;
  failedItems: RuleRunResult[];
};

type RuleRunResult = {
  rule: string;
  dataType: string;
  errorMessage: string;
  totalItemsCount: number;
  items: FailedItems[];
};

type FailedItems = {
  externalId: string;
};

const batchSize = 500000;

export const downloadAsJSON = async (downloadUrl: string, fileName: string) => {
  await fetch(downloadUrl)
    .then((response) => response.blob())
    .then((blobresp) => {
      const blob = new Blob([blobresp]);
      const name = `${fileName}.json`;

      downloadFile(blob, name);
    });
};

const downloadFile = (content: Blob, name: string) => {
  const url = window.URL.createObjectURL(content);
  const link = document.createElement('a');

  link.download = name;
  link.href = url;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  link.remove();
};

export const downloadAsExcel = async (
  downloadUrl: string,
  fileName: string
) => {
  const fileData: ReportFormat = await fetch(downloadUrl).then((res) =>
    res.json()
  );

  if (!fileData) throw Error('Missing file data!');

  const { endTime, failedItems } = fileData;

  const workbook: WorkBook = utils.book_new();

  let rows: any[] = [];

  // Parse all the rules and their failed items into excel rows
  failedItems.forEach((item: RuleRunResult) => {
    const failedData = item.items;

    const entities = failedData.map((data) => ({
      date: endTime,
      dataType: item.dataType,
      errorMessage: item.errorMessage,
      rule: item.rule,
      ...data,
    }));

    rows = rows.concat(entities);
  });

  /* Start writing to the excel workbook.
    If necessary, the rows will be batched to fit into multiple sheets. */

  // Create one sheet for all data
  if (rows.length < batchSize) {
    const worksheet = utils.json_to_sheet(rows);

    // Add headers to the sheet
    utils.sheet_add_aoa(
      worksheet,
      [['Date', 'Data Type', 'Error message', 'Rule name']],
      { origin: 'A1' }
    );

    utils.book_append_sheet(workbook, worksheet, 'Validation results');
  }
  // Create multiple sheets to fit the data
  else {
    for (let i = 0; i < rows.length; i += batchSize) {
      const batchedEntries = rows.slice(i, i + batchSize);
      const worksheet = utils.json_to_sheet(batchedEntries);

      // Add headers to the sheet
      utils.sheet_add_aoa(
        worksheet,
        [['Date', 'Data Type', 'Error message', 'Rule name']],
        { origin: 'A1' }
      );

      utils.book_append_sheet(
        workbook,
        worksheet,
        `Batch ${i} - ${i + batchSize}`
      );
    }
  }

  const workbookName = `${fileName}.xlsx`;

  writeFile(workbook, workbookName, {
    compression: true,
    Props: {
      Author: 'Cognite Cerberus',
      Title: 'Data validation report',
    },
  });
};
