/**
 * @jest-environment jsdom
 */
import { isValidSymbolFileSchema } from '../jsonUtils';

describe('isValidSymbolFileSchema', () => {
  test('Simple valid JSON', () => {
    document.body.innerHTML = `
    <div>
      <h1 id="path8272" />
      <h1 id="path11336" />
      <h1 id="path7868" />
      <h1 id="path7870" />
      <h1 id="path7872" />
      <h1 id="path7874" />
    </div>`;

    const jsonData = {
      lines: [
        {
          type: 'Line',
          pathIds: ['path8272'],
        },
        {
          type: 'Line',
          pathIds: ['path11336'],
        },
      ],
      symbolInstances: [
        {
          type: 'brick',
          pathIds: ['path7868', 'path7870', 'path7872', 'path7874'],
        },
      ],
      connections: [
        {
          start: 'path7868-path7870-path7872-path7874',
          end: 'path11336',
          direction: 'unknown',
        },
        {
          start: 'path8272',
          end: 'path11336',
          direction: 'unknown',
        },
      ],
    };
    const isValid = isValidSymbolFileSchema(
      jsonData,
      document as unknown as SVGSVGElement
    );
    expect(isValid).toEqual(true);
  });

  test('Connection refering to non existing end path', () => {
    document.body.innerHTML = `
    <div>
      <h1 id="path8272" />
      <h1 id="path11336" />
      <h1 id="path7868" />
      <h1 id="path7870" />
      <h1 id="path7872" />
      <h1 id="path7874" />
    </div>`;

    const jsonData = {
      lines: [
        {
          type: 'Line',
          pathIds: ['path8272'],
        },
        {
          type: 'Line',
          pathIds: ['path11336'],
        },
      ],
      symbolInstances: [
        {
          type: 'brick',
          pathIds: ['path7868', 'path7870', 'path7872', 'path7874'],
        },
      ],
      connections: [
        {
          start: 'path7868-path7870-path7872-path7874',
          end: 'path11336',
          direction: 'unknown',
        },
        {
          start: 'path8272',
          end: 'noneExisitingPath',
          direction: 'unknown',
        },
      ],
    };
    const isValid = isValidSymbolFileSchema(
      jsonData,
      document as unknown as SVGSVGElement
    );
    expect(isValid).toEqual(false);
  });

  test('Simple valid JSON without connection', () => {
    document.body.innerHTML = `
    <div>
      <h1 id="path8272" />
      <h1 id="path11336" />
      <h1 id="path7868" />
      <h1 id="path7870" />
      <h1 id="path7872" />
      <h1 id="path7874" />
    </div>`;

    const jsonData = {
      lines: [
        {
          type: 'Line',
          pathIds: ['path8272'],
        },
        {
          type: 'Line',
          pathIds: ['path11336'],
        },
      ],
      symbolInstances: [
        {
          type: 'brick',
          pathIds: ['path7868', 'path7870', 'path7872', 'path7874'],
        },
      ],
    };
    const isValid = isValidSymbolFileSchema(
      jsonData,
      document as unknown as SVGSVGElement
    );
    expect(isValid).toEqual(true);
  });

  test('Valid, without any lines', () => {
    document.body.innerHTML = `
    <div>
      <h1 id="path7868" />
      <h1 id="path7870" />
      <h1 id="path7872" />
      <h1 id="path7874" />
    </div>`;

    const jsonData = {
      lines: [],
      symbolInstances: [
        {
          type: 'brick',
          pathIds: ['path7868', 'path7870', 'path7872', 'path7874'],
        },
      ],
    };
    const isValid = isValidSymbolFileSchema(
      jsonData,
      document as unknown as SVGSVGElement
    );
    expect(isValid).toEqual(true);
  });

  test('valid without any data', () => {
    // eslint-disable-next-line no-useless-concat
    document.body.innerHTML = '<div>' + '</div>';

    const jsonData = {
      lines: [],
      symbolInstances: [],
    };
    const isValid = isValidSymbolFileSchema(
      jsonData,
      document as unknown as SVGSVGElement
    );
    expect(isValid).toEqual(true);
  });

  test('all in lines, not none in', () => {
    document.body.innerHTML = `
    <div>
      <h1 id="path8272" />
      <h1 id="path11336" />
    </div>`;

    const jsonData = {
      lines: [
        {
          type: 'Line',
          pathIds: ['path8272'],
        },
        {
          type: 'Line',
          pathIds: ['path11336'],
        },
      ],
      symbolInstances: [
        {
          type: 'brick',
          pathIds: ['path7868', 'path7870', 'path7872', 'path7874'],
        },
      ],
    };
    const isValid = isValidSymbolFileSchema(
      jsonData,
      document as unknown as SVGSVGElement
    );
    expect(isValid).toEqual(false);
  });

  test('All missing', () => {
    document.body.innerHTML = `<div></div>`;

    const jsonData = {
      lines: [
        {
          type: 'Line',
          pathIds: ['path8272'],
        },
        {
          type: 'Line',
          pathIds: ['path11336'],
        },
      ],
      symbolInstances: [
        {
          type: 'brick',
          pathIds: ['path7868', 'path7870', 'path7872', 'path7874'],
        },
      ],
    };
    const isValid = isValidSymbolFileSchema(
      jsonData,
      document as unknown as SVGSVGElement
    );
    expect(isValid).toEqual(false);
  });

  test('all in symbolInstance, not none in lines', () => {
    document.body.innerHTML = `
    <div>
      <h1 id="path7868" />
      <h1 id="path7870" />
      <h1 id="path7872" />
      <h1 id="path7874" />
    </div>`;

    const jsonData = {
      lines: [
        {
          type: 'Line',
          pathIds: ['path8272'],
        },
        {
          type: 'Line',
          pathIds: ['path11336'],
        },
      ],
      symbolInstances: [
        {
          type: 'brick',
          pathIds: ['path7868', 'path7870', 'path7872', 'path7874'],
        },
      ],
    };
    const isValid = isValidSymbolFileSchema(
      jsonData,
      document as unknown as SVGSVGElement
    );
    expect(isValid).toEqual(false);
  });
});
