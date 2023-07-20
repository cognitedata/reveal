import { PropsWithChildren } from 'react';

import { getProject, isUsingUnifiedSignin } from '@cognite/cdf-utilities';

import Link from '../../../../components/Link';
import { PROJECT_SWITCHER_WIDTH } from '../../../../utils/constants';

import { ItemProps } from './Item';

const ItemLink = (
  props: PropsWithChildren<Pick<ItemProps, 'item' | 'onClose' | 'isCompact'>>
) => {
  const { item, onClose, isCompact = false, children } = props;

  const { title, linkTo = '', externalLinkTo = '', sameWindow = false } = item;

  const linkToUrl = isUsingUnifiedSignin()
    ? `/${getProject()}${linkTo}`
    : linkTo;

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
        to={linkToUrl}
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
