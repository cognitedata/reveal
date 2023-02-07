import { SPLITROWCOL } from './DataCleanupComponent';
import { isGoogleDocPaste, parseGoogleTable } from './googleTables';

export const splitIntoColumnAndRow = (
  text: string,
  rowLength: number, // unused
  columnLength: number,
  columnSplitter: string
): string[] => {
  const rows = text.split('\n');
  const result = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const columns = row.split(columnSplitter);

    for (let j = 0; j < Math.min(columns.length - 1, columnLength - 1); j++) {
      const column = columns[j];
      result.push(column.trim());
    }

    const lastColumn = columns
      .slice(Math.min(columns.length - 1, columnLength - 1))
      .join(columnSplitter);
    result.push(lastColumn);
  }

  return result;
};
export const getCellById = (data: any, cellId: string) => {
  const [rowIndex, columnId] = cellId.split(SPLITROWCOL);
  const row: any = Object.values(data)[Number(rowIndex)];
  const cell = row.cells.find((cell: any) => cell.column.id === columnId);
  return cell || null;
};

export const handleOnPasteEvent = (
  e: ClipboardEvent,
  selectedCellIds: string[],
  data: any[],
  updateMyData: any
) => {
  if (!e.clipboardData) return;
  const pastedData = e.clipboardData.getData('Text');
  let dataToPaste: string | string[] = pastedData;

  const cells = selectedCellIds.map((cellId) => {
    return getCellById(data, cellId);
  });

  if (isGoogleDocPaste(e)) {
    const googleTable = parseGoogleTable(
      e.clipboardData.getData(
        'application/x-vnd.google-docs-document-slice-clip+wrapped'
      )
    );
    // Currently we use the selected cells to infer where and how to paste the data.
    // however for Google data we already have a fully parsed structure. So we could just use that.
    dataToPaste = googleTable.flat();
  } else {
    const rowIds = cells.map((cell) => cell.row.id);
    const uniqueRowLength = [...new Set(rowIds)].length;
    const columnIds = cells.map((cell) => cell.column.id);
    const uniqueColumnLength = [...new Set(columnIds)].length;

    if (uniqueRowLength > 1 || uniqueColumnLength > 1) {
      dataToPaste = splitIntoColumnAndRow(
        pastedData,
        uniqueRowLength,
        uniqueColumnLength,
        '\t'
      );
    }
  }

  cells.forEach((cell) => {
    const { row, column } = cell;
    const cellIndex = cells.indexOf(cell);
    const cellValue = Array.isArray(dataToPaste)
      ? dataToPaste[cellIndex]
      : dataToPaste;
    updateMyData(row.index, column.id, cellValue);
  });
};
