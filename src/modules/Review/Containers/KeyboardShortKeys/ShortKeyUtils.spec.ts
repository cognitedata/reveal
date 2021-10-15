import {
  extractAnnotationIdFromElement,
  getActiveKeypointSelection,
  getActiveRowIndex,
  getActiveRowSelection,
  getAnnotationIdOrKeypointIdForRowSelect,
} from 'src/modules/Review/Containers/KeyboardShortKeys/ShortKeyUtils';

describe('extractAnnotationIdFromElement', () => {
  const element = document.createElement('div');
  element.setAttribute('id', 'row-123456');

  it('should extract id string from element', () => {
    expect(extractAnnotationIdFromElement(element)).toEqual('123456');
  });
});

describe('getActiveRowIndex', () => {
  const element = document.createElement('div');
  element.innerHTML =
    '<div>' +
    '<div class="item" id="row-1"></div>' +
    '<div class="item" id="row-2"></div>' +
    '<div class="item active" id="row-3"></div>' +
    '<div class="item active" id="row-4"></div>' +
    '</div>';
  const htmlCollection = element.getElementsByClassName('item');

  it('should extract index of active element from collection of elements', () => {
    expect(getActiveRowIndex(htmlCollection)).toEqual(2);
  });
});

describe('getActiveKeypointSelection', () => {
  const element = document.createElement('div');
  element.innerHTML =
    '<div>' +
    '<div class="annotation-table-expand-row" id="row-1"></div>' +
    '<div class="annotation-table-expand-row active" id="row-2"></div>' +
    '<div class="annotation-table-expand-row active" id="row-3"></div>' +
    '<div class="annotation-table-expand-row" id="row-4"></div>' +
    '</div>';

  it('should extract active row element from a collection of keypoint row elements', () => {
    expect(getActiveKeypointSelection(element)).toBeDefined();
    expect(getActiveKeypointSelection(element)).toHaveAttribute('id', 'row-2');
  });
});

describe('getActiveRowSelection', () => {
  const element = document.createElement('div');
  element.innerHTML =
    '<div>' +
    '<div class="annotation-table-row active" id="row-1"></div>' +
    '<div class="annotation-table-row" id="row-2"></div>' +
    '<div class="annotation-table-row" id="row-3"></div>' +
    '<div class="annotation-table-row active" id="row-4"></div>' +
    '</div>';

  it('should extract active row element from a collection of keypoint row elements', () => {
    expect(getActiveRowSelection(element)).toBeDefined();
    expect(getActiveRowSelection(element)).toHaveAttribute('id', 'row-1');
  });
});

describe('getRowIndexOnApplyRowSelectShortKey', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  const annotationElement = document.createElement('div');

  annotationElement.innerHTML =
    '<div>' +
    '<div class="annotation-table-row active" id="row-1"></div>' +
    '<div class="annotation-table-row" id="row-2"></div>' +
    '<div class="annotation-table-row" id="row-3"></div>' +
    '<div class="annotation-table-row active" id="row-4"></div>' +
    '</div>';

  const keypointElement = document.createElement('div');

  keypointElement.innerHTML =
    '<div>' +
    '<div class="annotation-table-expand-row" id="row-1"></div>' +
    '<div class="annotation-table-expand-row" id="row-2"></div>' +
    '<div class="annotation-table-expand-row" id="row-3"></div>' +
    '<div class="annotation-table-expand-row active" id="row-4"></div>' +
    '</div>';

  const getPreviousRowIndex = (
    rows: HTMLCollectionOf<Element>,
    currentActiveRowIndex: 0
  ) => {
    const prevIndex = currentActiveRowIndex - 1;
    if (prevIndex < 0) {
      return rows.length + prevIndex;
    }
    return prevIndex;
  };

  const getNextRowIndex = (
    rows: HTMLCollectionOf<Element>,
    currentActiveRowIndex: 0
  ) => {
    const nextIndex = currentActiveRowIndex + 1;

    if (nextIndex < rows.length) {
      return nextIndex;
    }
    return nextIndex - rows.length;
  };
  const onFirstElement = () => {
    return 0;
  };

  const onNull = () => {
    return null;
  };

  const onOutOfArrayBounds = () => {
    return 1000;
  };

  const onUndefined = () => {
    return 1000;
  };

  it('should extract previous annotation or keypoint id', () => {
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        annotationElement,
        getPreviousRowIndex as any
      )
    ).toContain('4');
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        keypointElement,
        getPreviousRowIndex as any
      )
    ).toContain('3');
  });
  it('should extract next annotation or keypoint id', () => {
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        annotationElement,
        getNextRowIndex as any
      )
    ).toContain('2');
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        keypointElement,
        getNextRowIndex as any
      )
    ).toContain('1');
  });
  it('should correctly provide id as keypoint or not', () => {
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        annotationElement,
        getPreviousRowIndex as any
      )
    ).toContain(false);
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        keypointElement,
        getPreviousRowIndex as any
      )
    ).toContain(true);
  });
  it('should correctly provide first element', () => {
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        annotationElement,
        onFirstElement as any
      )
    ).toContain('1');
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        keypointElement,
        onFirstElement as any
      )
    ).toContain('1');
  });
  it('should handle null, undefined, out of bound indexes', () => {
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(annotationElement, onNull as any)
    ).toContain(null);
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        keypointElement,
        onOutOfArrayBounds as any
      )
    ).toContain(null);
    expect(
      getAnnotationIdOrKeypointIdForRowSelect(
        keypointElement,
        onUndefined as any
      )
    ).toContain(null);
  });
});
