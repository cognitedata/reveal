import CardHeader, { CardHeaderProps } from '../CardHeader';

import { CardContainer } from './elements';

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  header: CardHeaderProps;
  noPadding?: boolean;
};

const Card = ({ header, children, noPadding, ...rest }: CardProps) => {
  return (
    <CardContainer {...rest} className={`card ${rest.className || ''}`}>
      <CardHeader {...header} />
      {children && (
        <main className={noPadding ? 'no-padding' : undefined}>{children}</main>
      )}
    </CardContainer>
  );
};

export default Card;
