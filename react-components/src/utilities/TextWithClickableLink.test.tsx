import { describe, expect, test } from 'vitest';
import { TextWithClickableLink } from './TextWithClickableLink';
import { render, screen } from '@testing-library/react';

describe(TextWithClickableLink.name, () => {
  test('text without urls is rendered unchanged', () => {
    const textWithoutUrl = 'This text has no URLs';
    render(<TextWithClickableLink content={textWithoutUrl} />);

    const textNode = screen.getByText(textWithoutUrl);

    expect(textNode.innerText).toBe(textWithoutUrl);
  });

  test('URL is rendered as link', () => {
    const urlText = 'https://example.com';
    const { container } = render(<TextWithClickableLink content={urlText} />);

    const span = container.children[0];

    expect(span.children).toHaveLength(1);
    expectToBeUrlLink(span.children[0], urlText);
  });

  test('only URL text is made clickable', () => {
    const normalText0 = 'Some normal text, then a URL: ';
    const url = 'https://example.com/some/subpath?and=query&parameters=too';
    const normalText1 = ', and then some more text';

    const textWithUrlAndNormalText = `${normalText0}${url}${normalText1}`;

    const { container } = render(<TextWithClickableLink content={textWithUrlAndNormalText} />);

    const span = container.children[0];

    expect(span.children).toHaveLength(3);
    expect(span.children[0].textContent).toBe(normalText0);
    expectToBeUrlLink(span.children[1], url);
    expect(span.children[2].textContent).toBe(normalText1);
  });

  test('all URLs are made clickable', () => {
    const normalText0 = 'text ';
    const url0 = 'https://example.com/some/subpath?and=query&parameters=too';
    const normalText1 = ', some more text';
    const url1 = 'https://another-example.com/';

    const textWithUrlAndNormalText = `${normalText0}${url0}${normalText1}${url1}`;

    const { container } = render(<TextWithClickableLink content={textWithUrlAndNormalText} />);

    const span = container.children[0];

    expect(span.children).toHaveLength(4);
    expect(span.children[0].textContent).toBe(normalText0);
    expectToBeUrlLink(span.children[1], url0);
    expect(span.children[2].textContent).toBe(normalText1);
    expectToBeUrlLink(span.children[3], url1);
  });
});

function expectToBeUrlLink(element: Element, expectedUrl: string): void {
  expect(element.tagName).toBe('A');
  expect(element.getAttribute('href')).toBe(expectedUrl);
  expect(element.textContent).toBe(expectedUrl);
}
