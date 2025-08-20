import { type ReactElement, useMemo } from 'react';
import styled from 'styled-components';
import { getUrlRegex } from './getUrlRegex';

export function TextWithClickableLink({ content }: { content: string }): ReactElement {
  const urlComponents = useMemo(
    () =>
      content
        .split(getUrlRegex())
        .filter((element) => element !== '')
        .map((word, index) => {
          const match = getUrlRegex().test(word);

          const isValidUrl = (() => {
            try {
              const url = new URL(word);
              return url !== undefined;
            } catch (e) {
              return false;
            }
          })();

          if (match && isValidUrl) {
            return (
              <LinkText href={word} key={index}>
                {word}
              </LinkText>
            );
          }

          return <span key={index}>{word}</span>;
        }),
    [content]
  );

  return <span>{urlComponents}</span>;
}

const LinkText = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer'
})`
  text-decoration: underline;
  cursor: pointer;
`;
