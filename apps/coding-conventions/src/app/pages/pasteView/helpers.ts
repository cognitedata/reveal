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
      result.push(column);
    }

    const lastColumn = columns
      .slice(Math.min(columns.length - 1, columnLength - 1))
      .join(columnSplitter);
    result.push(lastColumn);
  }

  return result;
};

export const handleOnPasteEvent = (
  e: ClipboardEvent,
  selectedCellIds: any,
  cellsById: any
) => {
  if (!e.clipboardData) return;
  const pastedData = e.clipboardData.getData('Text');

  const cells = Object.keys(selectedCellIds).map((cellId) => {
    return cellsById[cellId];
  });

  const rowIds = cells.map((cell) => cell.row.id);
  const uniqueRowLength = [...new Set(rowIds)].length;
  const columnIds = cells.map((cell) => cell.column.id);
  const uniqueColumnLength = [...new Set(columnIds)].length;

  let dataToPaste: string | string[] = pastedData;

  if (uniqueRowLength > 1 || uniqueColumnLength > 1) {
    dataToPaste = splitIntoColumnAndRow(
      pastedData,
      uniqueRowLength,
      uniqueColumnLength,
      ' '
    );
  }

  cells.forEach((cell) => {
    const { row, column } = cell;
    const cellIndex = cells.indexOf(cell);
    const cellValue = Array.isArray(dataToPaste)
      ? dataToPaste[cellIndex]
      : dataToPaste;
    row.values[column.id] = cellValue;
  });
};
