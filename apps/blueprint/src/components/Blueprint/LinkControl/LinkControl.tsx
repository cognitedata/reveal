import { Button, Dropdown, Flex, Input, Menu } from '@cognite/cogs.js';
import { useState } from 'react';

import { Link } from './types';

export type LinkControlProps = {
  links?: Link[];
  onAddLink: (nextLink: Link) => void;
  onDeleteLinks: () => void;
};

export const BaseLinkControl: React.FC<LinkControlProps> = ({
  links = [],
  onAddLink,
  onDeleteLinks,
}) => {
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [processingLink, setProcessingLink] = useState<Link>({
    name: '',
    url: '',
  });

  const renderFooter = () => {
    if (!isEditingLink) {
      return (
        <Menu.Item
          onClick={() => {
            setIsEditingLink(true);
          }}
        >
          Add link
        </Menu.Item>
      );
    }
    return (
      <Menu.Footer>
        <Flex direction="column" gap={8}>
          <Input
            value={processingLink.name}
            placeholder="Name"
            onChange={(e) => {
              setProcessingLink({
                ...processingLink,
                name: e.target.value,
              });
            }}
          />
          <Input
            value={processingLink.url}
            placeholder="URL"
            onChange={(e) => {
              setProcessingLink({
                ...processingLink,
                url: e.target.value,
              });
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              onAddLink(processingLink);
              setProcessingLink({ name: '', url: '' });
              setIsEditingLink(false);
            }}
          >
            Add link
          </Button>
        </Flex>
      </Menu.Footer>
    );
  };
  return (
    <Dropdown
      content={
        <Menu style={{ minWidth: 240 }}>
          <Menu.Header>Links</Menu.Header>
          {links.map((link) => (
            <Menu.Item
              key={link.url}
              appendIcon="ExternalLink"
              onClick={() => {
                window.open(link.url, '_blank');
              }}
            >
              {link.name}
            </Menu.Item>
          ))}
          <Menu.Divider />
          {links.length !== 0 && (
            <Menu.Item
              onClick={() => {
                onDeleteLinks();
              }}
            >
              Clear links
            </Menu.Item>
          )}
          {renderFooter()}
        </Menu>
      }
    >
      <Button
        key="LinkControlButton"
        type="ghost"
        aria-label="fillControlButton"
        icon="Link"
      />
    </Dropdown>
  );
};
