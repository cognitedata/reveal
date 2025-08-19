import { type ReactElement, useMemo } from 'react';
import styled from 'styled-components';
import { isDefined } from './isDefined';
import { getUrlRegex } from './getUrlRegex';

export function TextWithClickableLink({ content }: { content: string }): ReactElement {
  const urlComponents = useMemo(
    () =>
      content
        .split(getUrlRegex())
        .filter((element) => element !== '')
        .map((word, index) => {
          const match = getUrlRegex().test(word);

          if (!match) {
            return <span key={index}>{word}</span>;
          }

          return (
            <LinkText href={word} key={index}>
              {word}
            </LinkText>
          );
        })
        .filter(isDefined),
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
