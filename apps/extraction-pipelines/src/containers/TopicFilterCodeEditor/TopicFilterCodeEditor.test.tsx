import {
  createEvent,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';

import TopicFilterCodeEditor from './TopicFilterCodeEditor';

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

test('default component loads', async () => {
  // ARRANGE
  render(<TopicFilterCodeEditor onChangeFormat={onChangeFormat} />);

  // ASSERT
  expect(screen.getByTestId('transform-code-editor-title')).toBeInTheDocument();
  expect(screen.getByTestId('transform-code-editor-title').textContent).toBe(
    'transformation-code'
  );
  expect(screen.getByTestId('transform-code-editor')).toBeInTheDocument();
  expect(
    screen.getByTestId('transform-code-editor-status-bar')
  ).toBeInTheDocument();
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
  expect(screen.getByTestId('transform-code-editor-title')).toBeInTheDocument();
  expect(screen.getByTestId('transform-code-editor-title').textContent).toBe(
    'transformation-code'
  );
  expect(screen.getByTestId('transform-code-editor')).toBeInTheDocument();
  expect(
    screen.getByTestId('transform-code-editor-status-bar')
  ).toBeInTheDocument();

  expect(screen.getByTestId('sample-code-editor-title')).toBeInTheDocument();
  expect(screen.getByTestId('sample-code-editor-title').textContent).toBe(
    'sample-json-data'
  );
  expect(screen.getByTestId('sample-code-editor')).toBeInTheDocument();
  expect(
    screen.getByTestId('sample-code-editor-status-bar')
  ).toBeInTheDocument();

  expect(screen.getByTestId('preview-title')).toBeInTheDocument();
  expect(screen.getByTestId('preview-title').textContent).toBe('sample-result');
  expect(screen.getByTestId('preview')).toBeInTheDocument();
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
  expect(codeEditor.childNodes[0]).toBeInTheDocument();
  expect(codeEditor.childNodes[0].textContent).toBe(
    'input.gatewayData.flatmap(tag =>'
  );
  expect(
    // eslint-disable-next-line testing-library/no-node-access
    editorElement.querySelector('.cm-lint-marker-error')
  ).not.toBeInTheDocument();
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
  expect(codeEditor.childNodes[0]).toBeInTheDocument();
  expect(codeEditor.childNodes[0].textContent).toBe(
    'input.gatewayData.flatmap(tag =>'
  );
  expect(
    // eslint-disable-next-line testing-library/no-node-access
    codeEditor.querySelectorAll('.cm-lint-marker-error')
  ).toBeTruthy();
});
