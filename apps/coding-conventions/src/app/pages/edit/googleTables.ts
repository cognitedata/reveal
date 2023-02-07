const START_OF_TABLE = '\u0010';
const END_OF_TABLE = '\u0011';
const START_OF_ROW = '\u0012';
const START_OF_COLUMN = '\u001c';

const removeNewLinesAndUnicode = (str: string) => {
  return str.replace(/(\r\n|\n|\r|\\x11)/gm, '').trim();
};

export const parseGoogleTable = (clipboardText: string) => {
  const jsonData = JSON.parse(clipboardText);

  const dsl_spacers = JSON.parse(jsonData.data).resolved.dsl_spacers as string;

  const dsl_spacers_array2 = dsl_spacers
    .split(START_OF_TABLE)[1]
    .split(END_OF_TABLE)[0]
    .split(START_OF_ROW);

  const rowAndColumns: string[][] = dsl_spacers_array2.reduce(
    (allRows: string[][], row: string) => {
      const columns = row.split(START_OF_COLUMN);

      columns.shift();
      const newRows = columns.reduce((acc: string[], column) => {
        const trimmed = removeNewLinesAndUnicode(column);
        if (trimmed) {
          return [...acc, trimmed];
        }
        return acc;
      }, []);
      if (newRows.length) {
        return [...allRows, newRows];
      }
      return allRows;
    },
    []
  );
  return rowAndColumns;
};

export const isGoogleDocTable = (inputData: string) => {
  const jsonData = JSON.parse(inputData);
  const startOfTable = '\u0010';

  const dsl_spacers = JSON.parse(jsonData.data).resolved.dsl_spacers;
  return dsl_spacers.includes(startOfTable);
};

export const isGoogleDocPaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return false;

  for (let i = 0; i < items.length; i++) {
    console.log('items[i].type', items[i].type);
    if (
      items[i].type ===
      'application/x-vnd.google-docs-document-slice-clip+wrapped'
    ) {
      // and the type is a Google Docs table
      if (isGoogleDocTable(e.clipboardData.getData(items[i].type))) {
        return true;
      }
    }
  }
  return false;
};
