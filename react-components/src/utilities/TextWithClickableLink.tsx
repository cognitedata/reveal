import { type ReactElement, useMemo } from 'react';
import styled from 'styled-components';
import { isDefined } from './isDefined';

export function TextWithClickableLink({ content }: { content: string }): ReactElement {
  // Adapted from https://gist.github.com/kiennt2/c9a489369562c424c793b8883b98802e
  const URL_REGEX = /(https?:\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]+[-A-Z0-9+&@#/%=~_|])/gi;

  const urlComponents = useMemo(
    () =>
      content
        .split(URL_REGEX)
        .map((word, index) => {
          const match = word.match(URL_REGEX);

          if (word === '') {
            return undefined;
          }

          if (match === null) {
            return <span key={index}>{word}</span>;
          }

          const url = match[0];
          return (
            <LinkText href={url} key={index}>
              {url}
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
