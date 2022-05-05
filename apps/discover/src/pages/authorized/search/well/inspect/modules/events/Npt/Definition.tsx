import { DEFINITION } from './constants';

export const Definition: React.FC<{ definition: string }> = ({
  definition,
}) => {
  return (
    <>
      <div style={{ fontSize: '11px' }}>{DEFINITION}</div>
      <div style={{ fontWeight: 'bolder' }}> {definition}</div>
    </>
  );
};
