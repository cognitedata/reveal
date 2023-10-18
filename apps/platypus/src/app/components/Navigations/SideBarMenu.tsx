import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { StorageProviderType } from '@fusion/data-modeling';
import uniqueId from 'lodash/uniqueId';

import {
  Body,
  Button,
  Flex,
  Icon,
  IconType,
  NotificationDot,
  Tooltip,
} from '@cognite/cogs.js';

import { useDMContext } from '../../context/DMContext';
import { TOKENS } from '../../di';
import { useNavigate } from '../../flags/useNavigate';
import { useInjection } from '../../hooks/useInjection';
import { useTranslation } from '../../hooks/useTranslation';
import { FeaturePreview } from '../FeaturePreview/FeaturePreview';

import * as S from './elements';

export type SideBarItem = {
  icon: IconType;
  slug: string;
  disabled?: boolean;
  tooltip?: string;
  splitter?: boolean;
  onClick?: () => void;
};

type SideBarProps = {
  items: Array<SideBarItem>;
};

const HAS_SEEN_EXPERIMENTAL_FEATURES = 'HAS_SEEN_EXPERIMENTAL_FEATURES';

export const SideBarMenu = ({ items }: SideBarProps) => {
  const [hasSeenTooltip, setLocalHasSeenTooltip] = useState(true);
  const { selectedDataModel } = useDMContext();

  const { externalId: dataModelExternalId, version, space } = selectedDataModel;

  const { t } = useTranslation('Sidebar menu');

  const [showFeatureToggle, setShowFeatureToggle] = useState(false);

  const { pathname } = useLocation();

  const navigate = useNavigate();

  const baseNavigationRoute = `/${space}/${dataModelExternalId}/${version}`;

  const localStorageProvider = useInjection(
    TOKENS.storageProviderFactory
  ).getProvider(StorageProviderType.localStorage);

  useEffect(
    () =>
      setLocalHasSeenTooltip(
        localStorageProvider.getItem(HAS_SEEN_EXPERIMENTAL_FEATURES) || false
      ),
    [localStorageProvider]
  );

  const setHasSeenTooltip = useCallback(() => {
    setLocalHasSeenTooltip(true);
    localStorageProvider.setItem(HAS_SEEN_EXPERIMENTAL_FEATURES, true);
  }, [localStorageProvider]);

  const getNextRoute = (slug: string) => {
    return `${baseNavigationRoute}/${slug}`;
  };

  const onRoute = (slug: string) => {
    navigate(getNextRoute(slug));
  };

  const renderIcon = (item: SideBarItem) => {
    const isActive =
      pathname.endsWith(getNextRoute(item.slug)) ||
      (pathname.endsWith(baseNavigationRoute) && !item.slug);
    return (
      <>
        {item.splitter && <S.Splitter />}
        <S.SideBarItem
          type={isActive ? 'secondary' : 'ghost'}
          toggled={isActive}
          key={item.slug}
          disabled={item.disabled}
          onClick={() => {
            if (item.onClick) {
              item.onClick();
            } else {
              onRoute(item.slug);
            }
          }}
        >
          <Icon type={item.icon} />
        </S.SideBarItem>
      </>
    );
  };

  return (
    <S.SideBarMenu>
      {items.map((item) => {
        if (item.tooltip) {
          return (
            <Tooltip
              placement="right"
              content={item.tooltip}
              arrow={false}
              delay={250}
              key={`${item.slug}-${uniqueId()}`}
            >
              {renderIcon(item)}
            </Tooltip>
          );
        }
        return renderIcon(item);
      })}
      <div style={{ flex: 1 }} />

      <Tooltip
        placement="right"
        visible={!hasSeenTooltip || undefined}
        interactive
        content={
          <Flex direction="column" gap={8} style={{ maxWidth: 240 }}>
            <Body level={2} style={{ color: 'white' }} strong>
              {t(
                'experimental-feature-menu-tooltip',
                'Experimental features available'
              )}
            </Body>
            <Body level={2} style={{ color: 'white' }}>
              {t(
                'experimental-feature-menu-tooltip-body',
                'Toggle on and off new features that are not yet ready for the public.'
              )}
            </Body>
            {!hasSeenTooltip && (
              <Flex direction="row-reverse">
                <Button
                  inverted
                  type="primary"
                  size="small"
                  style={{
                    background: 'var(--cogs-decorative--gradient--dawn)',
                    color: 'white',
                  }}
                  onClick={() => {
                    setHasSeenTooltip();
                  }}
                >
                  OK
                </Button>
              </Flex>
            )}
          </Flex>
        }
        delay={250}
      >
        <NotificationDot>
          {renderIcon({
            icon: 'Lightning',
            slug: '#preview',
            disabled: false,
            onClick: () => {
              setShowFeatureToggle(true);
            },
          })}
        </NotificationDot>
      </Tooltip>
      {document.querySelector('.ReactQueryDevtools') && (
        <div style={{ height: 40 }} />
      )}

      {showFeatureToggle && (
        <FeaturePreview
          onRequestClose={(hasChanged) => {
            setShowFeatureToggle(false);
            if (hasChanged) {
              window.location.reload();
            }
          }}
        />
      )}
    </S.SideBarMenu>
  );
};
