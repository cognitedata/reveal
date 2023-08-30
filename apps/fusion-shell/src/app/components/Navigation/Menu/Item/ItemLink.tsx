import { PropsWithChildren } from 'react';

import { PROJECT_SWITCHER_WIDTH } from '../../../../utils/constants';
import Link from '../../../Link';

import { ItemProps } from './Item';

const ItemLink = (
  props: PropsWithChildren<Pick<ItemProps, 'item' | 'onClose' | 'isCompact'>>
) => {
  const { item, onClose, isCompact = false, children } = props;

  const { title, linkTo = '', externalLinkTo = '', sameWindow = false } = item;

  const linkWidthStyle = isCompact
    ? { flex: `1 1 ${PROJECT_SWITCHER_WIDTH}px` }
    : {};

  if (externalLinkTo) {
    return (
      <a
        href={externalLinkTo}
        target={sameWindow ? '_self' : '_blank'}
        rel="noopener noreferrer"
        onClick={() => onClose && onClose(title)}
        style={linkWidthStyle}
      >
        {children}
      </a>
    );
  }

  if (linkTo) {
    return (
      <Link
        to={linkTo}
        onClick={() => onClose && onClose(title)}
        style={linkWidthStyle}
      >
        {children}
      </Link>
    );
  }

  return null;
};

export default ItemLink;
