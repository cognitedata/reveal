import * as React from 'react';

import { Subtitle } from './Subtitle';

export interface Props {
  children?: string;
}
export const SubtitlePlain: React.FC<Props> = ({ children }) => {
  return <Subtitle>{children}</Subtitle>;
};
