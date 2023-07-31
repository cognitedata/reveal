import { useLastVisited } from 'hooks';

import CardHeader, { CardHeaderProps } from '../CardHeader';

import { CardContainer } from './elements';

export type CardProps = React.HTMLAttributes<HTMLElement> & {
  lastVistedKey?: string;
  children?: React.ReactNode;
  header: CardHeaderProps;
  noPadding?: boolean;
  url?: string;
  isMini?: boolean;
};

const Card = ({
  lastVistedKey,
  header,
  children,
  noPadding,
  url,
  isMini,
  onClick,
  ...rest
}: CardProps) => {
  const { setAsLastvisited } = useLastVisited(lastVistedKey || '');
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          setAsLastvisited();
          if (onClick) onClick(e);
        }}
        {...rest}
      >
        <CardContainer
          {...rest}
          className={`card ${rest.className || ''} ${
            isMini ? 'card-mini' : ''
          }`}
        >
          <CardHeader {...header} />
          {children && (
            <main className={noPadding ? 'no-padding' : undefined}>
              {children}
            </main>
          )}
        </CardContainer>
      </a>
    );
  }
  return (
    <CardContainer
      {...rest}
      className={`card ${rest.className || ''} ${isMini ? 'card-mini' : ''}`}
      onClick={(e) => {
        setAsLastvisited();
        if (onClick) onClick(e);
      }}
    >
      <CardHeader {...header} />
      {children && (
        <main className={noPadding ? 'no-padding' : undefined}>{children}</main>
      )}
    </CardContainer>
  );
};

export default Card;
