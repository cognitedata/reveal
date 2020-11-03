import React from 'react';
import styled from 'styled-components';
import { Icon, Dropdown, Menu, Overline, Colors } from '@cognite/cogs.js';
import {
  useCollections,
  Collection,
  useUpdateCollections,
} from 'lib/hooks/CollectionsHooks';
import { ResourceType } from 'lib/types';

const CollectionsDropdown = ({
  type,
  items,
  button,
}: {
  type: ResourceType;
  items: { id: number }[];
  button: React.ReactElement;
}) => {
  const { data: collections } = useCollections();
  const [updateCollections] = useUpdateCollections();

  const resourceCollections = (collections || []).filter(
    collection => collection.type === type
  );

  const addToCollection = (
    collection: Collection,
    currentItems: { id: number }[]
  ) => {
    // If the collection is not empty, concat the items in the collection
    // with the selected items, else set the items to the selected items
    const updatedItems = collection.operationBody.items
      ? collection.operationBody.items.concat(
          currentItems
            .filter(
              asset =>
                !collection.operationBody.items.some(
                  (item: any) => item.id === asset.id
                )
            )
            .map(({ id }) => ({ id }))
        )
      : currentItems;
    updateCollections([
      {
        id: collection.id,
        update: {
          operationBody: {
            items: updatedItems,
          },
        },
      },
    ]);
  };

  const collectionContainsItems = (collection: Collection) =>
    items.every(item =>
      collection.operationBody.items?.some((el: any) => el.id === item.id)
    );

  return (
    <Dropdown
      content={
        <Menu>
          <Menu.Header>
            <Overline level={2}>COLLECTIONS</Overline>
          </Menu.Header>
          {resourceCollections.length === 0 && (
            <NoCollectionsMessage>
              You have no collections for this resource type
            </NoCollectionsMessage>
          )}
          {resourceCollections.map(collection => {
            const containsItems = collectionContainsItems(collection);
            return (
              <Menu.Item
                key={collection.id}
                disabled={containsItems}
                onClick={() => addToCollection(collection, items)}
              >
                <CollectionItem>
                  {collection.name}
                  {containsItems && <CheckIcon type="Check" />}
                </CollectionItem>
              </Menu.Item>
            );
          })}
        </Menu>
      }
    >
      {button}
    </Dropdown>
  );
};

const CollectionItem = styled.div`
  justify-content: space-between;
  text-align: left;
  width: 100%;
  display: flex;
`;

const NoCollectionsMessage = styled(Menu.Footer)`
  color: black;
  text-align: center;
`;

const CheckIcon = styled(Icon)`
  color: ${Colors.success.hex()};
  margin-left: 8px;
`;

export default CollectionsDropdown;
