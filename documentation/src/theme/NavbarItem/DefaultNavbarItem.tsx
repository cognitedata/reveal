/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useOnClickOutside from 'use-onclickoutside';
import type {
  NavLinkProps,
  DesktopOrMobileNavBarItemProps,
  Props,
} from '@theme/NavbarItem/DefaultNavbarItem';

function NavLink({
  activeBasePath,
  activeBaseRegex,
  to,
  href,
  label,
  activeClassName = 'navbar__link--active',
  prependBaseUrlToHref,
  ...props
}: NavLinkProps) {
  // TODO all this seems hacky
  // {to: 'version'} should probably be forbidden, in favor of {to: '/version'}
  const toUrl = useBaseUrl(to);
  const activeBaseUrl = useBaseUrl(activeBasePath);
  const normalizedHref = useBaseUrl(href, {forcePrependBaseUrl: true});

  return (
    <Link
      {...(href
        ? {
            target: '_blank',
            rel: 'noopener noreferrer',
            href: prependBaseUrlToHref ? normalizedHref : href,
          }
        : {
            isNavLink: true,
            activeClassName,
            to: toUrl,
            ...(activeBasePath || activeBaseRegex
              ? {
                  isActive: (_match, location) =>
                    activeBaseRegex
                      ? new RegExp(activeBaseRegex).test(location.pathname)
                      : location.pathname.startsWith(activeBaseUrl),
                }
              : null),
          })}
      {...props}>
      {label}
    </Link>
  );
}

function NavItemDesktop({
  items,
  position,
  className,
  ...props
}: DesktopOrMobileNavBarItemProps) {
  const dropDownRef = React.useRef<HTMLDivElement>(null);
  const dropDownMenuRef = React.useRef<HTMLUListElement>(null);
  const [showDropDown, setShowDropDown] = useState(false);
  useOnClickOutside(dropDownRef, () => toggle(false));
  function toggle(state: boolean) {
    if (state) {
      const firstNavLinkOfULElement =
        dropDownMenuRef?.current?.firstChild?.firstChild;

      if (firstNavLinkOfULElement) {
        (firstNavLinkOfULElement as HTMLElement).focus();
      }
    }
    setShowDropDown(state);
  }
  const navLinkClassNames = (extraClassName?: string, isDropdownItem = false) =>
    clsx(
      {
        'navbar__item navbar__link': !isDropdownItem,
        dropdown__link: isDropdownItem,
      },
      extraClassName,
    );

  if (!items) {
    return <NavLink className={navLinkClassNames(className)} {...props} />;
  }

  return (
    <div
      ref={dropDownRef}
      className={clsx('navbar__item', 'dropdown', 'dropdown--hoverable', {
        'dropdown--left': position === 'left',
        'dropdown--right': position === 'right',
        'dropdown--show': showDropDown,
      })}>
      <NavLink
        className={navLinkClassNames(className)}
        {...props}
        onClick={props.to ? undefined : (e) => e.preventDefault()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' && !props.to) || e.key === 'Tab') {
            e.preventDefault();
            toggle(true);
          }
        }}>
        {props.label}
      </NavLink>
      <ul ref={dropDownMenuRef} className="dropdown__menu">
        {items.map(({className: childItemClassName, ...childItemProps}, i) => (
          <li key={i}>
            <NavLink
              onKeyDown={(e) => {
                if (i === items.length - 1 && e.key === 'Tab') {
                  e.preventDefault();
                  toggle(false);
                }
              }}
              activeClassName="dropdown__link--active"
              className={navLinkClassNames(childItemClassName, true)}
              {...childItemProps}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavItemMobile({
  items,
  position: _position,
  className,
  ...props
}: DesktopOrMobileNavBarItemProps) {
  // Need to destructure position from props so that it doesn't get passed on.
  const navLinkClassNames = (extraClassName?: string, isSubList = false) =>
    clsx(
      'menu__link',
      {
        'menu__link--sublist': isSubList,
      },
      extraClassName,
    );

  if (!items) {
    return (
      <li className="menu__list-item">
        <NavLink className={navLinkClassNames(className)} {...props} />
      </li>
    );
  }

  return (
    <li className="menu__list-item">
      <NavLink className={navLinkClassNames(className, true)} {...props}>
        {props.label}
      </NavLink>
      <ul className="menu__list">
        {items.map(({className: childItemClassName, ...childItemProps}, i) => (
          <li className="menu__list-item" key={i}>
            <NavLink
              activeClassName="menu__link--active"
              className={navLinkClassNames(childItemClassName)}
              {...childItemProps}
              onClick={props.onClick}
            />
          </li>
        ))}
      </ul>
    </li>
  );
}

function DefaultNavbarItem({mobile = false, ...props}: Props): JSX.Element {
  const Comp = mobile ? NavItemMobile : NavItemDesktop;
  return <Comp {...props} />;
}

export default DefaultNavbarItem;
