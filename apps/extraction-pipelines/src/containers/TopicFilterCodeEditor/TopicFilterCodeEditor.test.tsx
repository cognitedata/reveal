import { expect } from '@jest/globals';
import {
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';

import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { TopicFilterCodeEditor } from './TopicFilterCodeEditor';

const onChangeFormat = jest.fn();

jest.mock('../../common', () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () =>
          new Promise<void>((resolve) => {
            resolve();
          }),
        // You can include here any property your component may use
      },
    };
  },
}));

describe('Test basic copy paste', () => {
  const testForTransformCodeEditor = () => {
    expect(screen.getByTestId('transform-code-editor-title')).toBeInstanceOf(
      HTMLElement
    );
    expect(screen.getByTestId('transform-code-editor-title').textContent).toBe(
      'transformation-code'
    );
    expect(screen.getByTestId('transform-code-editor')).toBeInstanceOf(
      HTMLElement
    );
    expect(
      screen.getByTestId('transform-code-editor-status-bar')
    ).toBeInstanceOf(HTMLElement);
  };

  test('default component loads', async () => {
    // ARRANGE
    render(<TopicFilterCodeEditor onChangeFormat={onChangeFormat} />);

    // ASSERT
    testForTransformCodeEditor();
  });

  test('default component loads when sample data option is enabled', async () => {
    // ARRANGE
    render(
      <TopicFilterCodeEditor
        onChangeFormat={onChangeFormat}
        showSampleData={true}
      />
    );

    // ASSERT
    testForTransformCodeEditor();

    expect(screen.getByTestId('sample-code-editor-title')).toBeInstanceOf(
      HTMLElement
    );
    expect(screen.getByTestId('sample-code-editor-title').textContent).toBe(
      'sample-json-data'
    );
    expect(screen.getByTestId('sample-code-editor')).toBeInstanceOf(
      HTMLElement
    );
    expect(screen.getByTestId('sample-code-editor-status-bar')).toBeInstanceOf(
      HTMLElement
    );

    expect(screen.getByTestId('preview-title')).toBeInstanceOf(HTMLElement);
    expect(screen.getByTestId('preview-title').textContent).toBe(
      'sample-result'
    );
    expect(screen.getByTestId('preview')).toBeInstanceOf(HTMLElement);
  });

  test('paste correct transform code', async () => {
    // ARRANGE
    render(<TopicFilterCodeEditor onChangeFormat={onChangeFormat} />);

    const editorElement = screen.getByTestId('transform-code-editor');

    const codeEditor = within(editorElement).getByRole('textbox');
    const activeLine = codeEditor.childNodes[0] as HTMLDivElement;

    // USER EVENT - paste code into transform code editor

    activeLine.focus(); //Focus input
    const paste = createEvent.paste(activeLine, {
      clipboardData: {
        getData: () =>
          'input.gatewayData.flatmap(tag =>\n' +
          '\ttag.vqts.map(vqt => {\n' +
          '\t\t"externalId": concat("rockwelltest/", tag.tag_id),\n' +
          '\t\t"value": vqt.v,"timestamp": to_unix_timestamp(vqt.t, "%a %b %d %Y %T GMT%z"),\n' +
          '\t\t"type": "datapoint"\n' +
          '\t\t}))',
      },
    });

    fireEvent(activeLine, paste);

    // ASSERT
    expect(codeEditor.childNodes[0]).toBeInstanceOf(HTMLElement);
    expect(codeEditor.childNodes[0].textContent).toBe(
      'input.gatewayData.flatmap(tag =>'
    );
    expect(
      // eslint-disable-next-line testing-library/no-node-access
      editorElement.querySelector('.cm-lint-marker-error')
    ).not.toBeInstanceOf(HTMLElement);
  });

  test('paste incorrect transform code', async () => {
    // ARRANGE
    render(<TopicFilterCodeEditor onChangeFormat={onChangeFormat} />);

    const editorElement = screen.getByTestId('transform-code-editor');

    const codeEditor = within(editorElement).getByRole('textbox');
    const activeLine = codeEditor.childNodes[0] as HTMLDivElement;

    // USER EVENT - paste code into transform code editor

    activeLine.focus(); //Focus input
    const paste = createEvent.paste(activeLine, {
      clipboardData: {
        getData: () =>
          'input.gatewayData.flatmap(tag =>\n' +
          '\ttag.vqts.map(vqt => {\n' +
          '\t\t"externalId": concat("rockwelltest/", tag.tag_id),\n' +
          '\t\t"value": vqt.v,"timestamp": to_unix_timestamp(vqt.t, "%a %b %d %Y %T GMT%z"),\n' +
          '\t\t"type": "datapoint"\n' +
          '\t\t})',
      },
    });

    fireEvent(activeLine, paste);

    // ASSERT
    expect(codeEditor.childNodes[0]).toBeInstanceOf(HTMLElement);
    expect(codeEditor.childNodes[0].textContent).toBe(
      'input.gatewayData.flatmap(tag =>'
    );
    expect(
      // eslint-disable-next-line testing-library/no-node-access
      codeEditor.querySelectorAll('.cm-lint-marker-error')
    ).toBeTruthy();
  });
});
