import Highlighter from 'react-highlight-words';
import { Link } from 'react-router-dom';

import { Menu } from 'antd';

import { createLink } from '@cognite/cdf-utilities';
import { Flex, Icon, IconType } from '@cognite/cogs.js';
import { SdkResourceType } from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '../../common/i18n';

import { CopyButton } from './CopyButton';

export interface ResourcesMenuListProps {
  items: any[];
  /** Returns true once the request has finished running. */
  isFetched: boolean;
  /** The label to display for each menu group. */
  groupLabel: string;
  /** The icon to display alongside each menu item. */
  icon: IconType;
  /**
   * A function to build the links for the resources.
   * @param id {string} The resource id to send to
   */
  url: (id: string) => string;
  /** This is the url to go to when the user wants to see all results. */
  allUrl: string;
  /** The search query we use to highlight search results. */
  query: string;
  /**
   * Represents the type of the resource this group is rendering the list for,
   * e.g. assets, timeseries, datasets, etc.
   */
  type: Exclude<SdkResourceType, 'extpipes' | 'labels' | 'groups'>;
  /** The function to call that will force the Menu to close. */
  onClose: () => void;
}

export const ResourcesMenuList = ({
  items = [],
  isFetched,
  groupLabel,
  icon,
  url,
  allUrl,
  query,
  type,
  onClose,
}: ResourcesMenuListProps) => {
  const { t } = useTranslation();

  const itemsCount = items?.length;
  return isFetched && itemsCount > 0 ? (
    <Menu.ItemGroup
      title={
        <Flex alignItems="center" justifyContent="space-between">
          <Flex gap={8} alignItems="center">
            <span>{groupLabel}</span>
          </Flex>
          <Link onClick={onClose} to={createLink(allUrl, { q: `${query}` })}>
            {t(`browse-${type}`)}
          </Link>
        </Flex>
      }
    >
      {items.map((resource) => (
        <Menu.Item
          key={`${resource.externalId}-${resource.id}`}
          className="resource-menu-item"
        >
          <Flex gap={4} justifyContent="space-between" alignItems="center">
            <Link to={url(resource.id)} style={{ flexGrow: 1 }}>
              <Flex gap={8} alignItems="center">
                <Icon type={icon} />
                {/* TODO: can we get rid of the highlighting? */}
                <Highlighter
                  autoEscape
                  searchWords={(query || '').split(' ')}
                  textToHighlight={
                    // Depending on the resource type, and especially in the case of data sets
                    // we aren't sure whether if id is the property we want to render. There is a possibility
                    // this order of rendering is wrong, but we will need to make sure that's the case in test
                    // environments this seems to work as it should.
                    // Prioritizing name, because it "should" be the most descriptive to users, but not present on all resources.
                    // TODO: write testsssss!!!!
                    resource.name ||
                    // Thinking this should be the second most important identifier, since the data seems to duplicate name with externalId.
                    resource.externalId ||
                    // Events have a lack of `name`, but seem to use description as the name.
                    resource.description ||
                    // I'm assuming this is the fallback, the other ones should take priority. But does that mean we can no longer search for
                    // resources by their id? We will have a "Copy ID" button, but we probably need to make all of these valid options.
                    resource.id.toString()
                  }
                />
              </Flex>
            </Link>
            <CopyButton
              label={t('copy-id')}
              textToCopy={resource.id.toString()}
            />
          </Flex>
        </Menu.Item>
      ))}
    </Menu.ItemGroup>
  ) : (
    <></>
  );
};
