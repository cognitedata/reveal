import isNumber from 'lodash-es/isNumber';

export const extractAnnotationIdFromElement = (
  element: Element
): string | null => {
  if (element) {
    return element.id.replace('row-', '');
  }
  return null;
};

export const getActiveRowIndex = (
  elements: HTMLCollection
): number | undefined => {
  for (let index = 0; index < elements.length; index++) {
    const elm = elements.item(index);
    if (!!elm && elm.classList.contains('active')) {
      return index;
    }
  }
  return undefined;
};

export const getActiveKeypointSelection = (
  parentElement: HTMLElement
): null | Element => {
  if (parentElement) {
    return parentElement
      .getElementsByClassName('annotation-table-expand-row active')
      .item(0);
  }
  return null;
};

export const getActiveRowSelection = (
  parentElement: HTMLElement
): null | Element => {
  if (parentElement) {
    return parentElement
      .getElementsByClassName('annotation-table-row active')
      .item(0);
  }
  return null;
};

export const getAnnotationIdOrKeypointIdForRowSelect = (
  parentElement: HTMLElement | null,
  getRowIndex: (
    row: HTMLCollectionOf<Element>,
    currentActiveRowIndex: number | undefined
  ) => number | null
): [id: string | null, isKeypoint: boolean] => {
  let annotationOrKeypointId = null;
  let activeKeypoint;
  if (parentElement && !!getRowIndex) {
    let rows;

    activeKeypoint = getActiveKeypointSelection(parentElement);

    if (activeKeypoint) {
      rows = activeKeypoint.parentElement!.getElementsByClassName(
        'annotation-table-expand-row'
      );
    } else {
      rows = parentElement.getElementsByClassName('annotation-table-row');
    }

    if (rows.length) {
      const currentActiveRowIndex = getActiveRowIndex(rows);

      const rowIndex = getRowIndex(rows, currentActiveRowIndex);

      if (isNumber(rowIndex) && rowIndex >= 0 && rowIndex < rows.length) {
        annotationOrKeypointId = extractAnnotationIdFromElement(rows[rowIndex]);
      } else {
        console.error('ShortKeyUtils: Received invalid row index!', {
          rows,
          rowIndex,
        });
      }
    }
  }
  return [annotationOrKeypointId, !!activeKeypoint];
};
