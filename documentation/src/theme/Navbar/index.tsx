import React, {useCallback, useState, useEffect} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import SearchBar from '@theme/SearchBar';
import Toggle from '@theme/Toggle';
import useThemeContext from '@theme/hooks/useThemeContext';
import useHideableNavbar from '@theme/hooks/useHideableNavbar';
import useLockBodyScroll from '@theme/hooks/useLockBodyScroll';
import useWindowSize, {windowSizes} from '@theme/hooks/useWindowSize';
import useLogo from '@theme/hooks/useLogo';

import styles from './styles.module.css';
import NavbarItem from '@theme/NavbarItem';

// retrocompatible with v1
const DefaultNavItemPosition = 'right';

// If split links by left/right
// if position is unspecified, fallback to right (as v1)
function splitNavItemsByPosition(items: any) {
  const leftItems = items.filter(
    (item: any) => (item.position ?? DefaultNavItemPosition) === 'left',
  );
  const rightItems = items.filter(
    (item: any) => (item.position ?? DefaultNavItemPosition) === 'right',
  );
  return {
    leftItems,
    rightItems,
  };
}

/**
 * It's swizzled because we copy docs sidebar (bot right) into navbar sidebar (top left)
 * That's done to avoid having almost empty sidebar menu on mobile.
 * We should remove that component once we have more items for sidebar.
 */
function Navbar(): JSX.Element {
  // navbar hacks
  useEffect(() => {
    let leftMenu = document.querySelector<HTMLDivElement>('.navbar-sidebar__items .menu');
    let docsMenu = document.querySelector<HTMLUListElement>('.main-wrapper .menu .menu__list')
    const id = 'sidebar-hacks-id'
    if (leftMenu && docsMenu && !document.getElementById(id)) {
      let docsMenuCloned = docsMenu.cloneNode(true) as HTMLUListElement;
      docsMenuCloned.id = id;

      // Since it's dummy HTML copying – links are common <a> tags and won't be handled by the app.
      // It means the page will be reloaded every time one of these links is clicked (like in multipage or common websites, i.e. not SPA).
      // Also, 'active' state classes are removed from here because they won't be updated that way
      for (let el of docsMenuCloned.querySelectorAll('.menu__link--active')) {
        el.classList.remove('menu__link--active')
        el.classList.remove('active')
      }

      leftMenu.prepend(document.createElement('hr'));
      leftMenu.prepend(docsMenuCloned);
    }
  }, [])

  const {
    siteConfig: {
      themeConfig: {
        navbar: {title = '', items = [], hideOnScroll = false} = {},
        colorMode: {disableSwitch: disableColorModeSwitch = false} = {},
      },
    },
    isClient,
  } = useDocusaurusContext();
  const [sidebarShown, setSidebarShown] = useState(false);
  const [isSearchBarExpanded, setIsSearchBarExpanded] = useState(false);

  const {isDarkTheme, setLightTheme, setDarkTheme} = useThemeContext();
  const {navbarRef, isNavbarVisible} = useHideableNavbar(hideOnScroll);
  const {logoLink, logoLinkProps, logoImageUrl, logoAlt} = useLogo();

  useLockBodyScroll(sidebarShown);

  const showSidebar = useCallback(() => {
    setSidebarShown(true);
  }, [setSidebarShown]);
  const hideSidebar = useCallback(() => {
    setSidebarShown(false);
  }, [setSidebarShown]);

  const onToggleChange = useCallback(
    (e) => (e.target.checked ? setDarkTheme() : setLightTheme()),
    [setLightTheme, setDarkTheme],
  );

  const windowSize = useWindowSize();

  useEffect(() => {
    if (windowSize === windowSizes.desktop) {
      setSidebarShown(false);
    }
  }, [windowSize]);

  const {leftItems, rightItems} = splitNavItemsByPosition(items);

  return (
    <nav
      ref={navbarRef}
      className={clsx('navbar', 'navbar--light', 'navbar--fixed-top', {
        'navbar-sidebar--show': sidebarShown,
        [styles.navbarHideable]: hideOnScroll,
        [styles.navbarHidden]: !isNavbarVisible,
      })}>
      <div className="navbar__inner">
        <div className="navbar__items">
          {items != null && items.length !== 0 && (
            <div
              aria-label="Navigation bar toggle"
              className="navbar__toggle"
              role="button"
              tabIndex={0}
              onClick={showSidebar}
              onKeyDown={showSidebar}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 30 30"
                role="img"
                focusable="false">
                <title>Menu</title>
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                  strokeWidth="2"
                  d="M4 7h22M4 15h22M4 23h22"
                />
              </svg>
            </div>
          )}
          <Link className="navbar__brand" to={logoLink} {...logoLinkProps}>
            {logoImageUrl != null && (
              <img
                key={isClient}
                className="navbar__logo"
                src={logoImageUrl}
                alt={logoAlt}
              />
            )}
            {title != null && (
              <strong
                className={clsx('navbar__title', {
                  [styles.hideLogoText]: isSearchBarExpanded,
                })}>
                {title}
              </strong>
            )}
          </Link>
          {leftItems.map((item: any, i: number) => (
            <NavbarItem {...item} key={i} />
          ))}
        </div>
        <div className="navbar__items navbar__items--right">
          {rightItems.map((item: any, i: number) => (
            <NavbarItem {...item} key={i} />
          ))}
          {!disableColorModeSwitch && (
            <Toggle
              className={styles.displayOnlyInLargeViewport}
              aria-label="Dark mode toggle"
              checked={isDarkTheme}
              onChange={onToggleChange}
            />
          )}
          <SearchBar
            handleSearchBarToggle={setIsSearchBarExpanded}
            isSearchBarExpanded={isSearchBarExpanded}
          />
        </div>
      </div>
      <div
        role="presentation"
        className="navbar-sidebar__backdrop"
        onClick={hideSidebar}
      />
      <div className="navbar-sidebar">
        <div className="navbar-sidebar__brand">
          <Link
            className="navbar__brand"
            onClick={hideSidebar}
            to={logoLink}
            {...logoLinkProps}>
            {logoImageUrl != null && (
              <img
                key={isClient}
                className="navbar__logo"
                src={logoImageUrl}
                alt={logoAlt}
              />
            )}
            {title != null && (
              <strong className="navbar__title">{title}</strong>
            )}
          </Link>
          {!disableColorModeSwitch && sidebarShown && (
            <Toggle
              aria-label="Dark mode toggle in sidebar"
              checked={isDarkTheme}
              onChange={onToggleChange}
            />
          )}
        </div>
        <div className="navbar-sidebar__items">
          <div className="menu">
            <ul className="menu__list">
              {items.map((item: any, i: number) => (
                <NavbarItem mobile {...item} onClick={hideSidebar} key={i} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
