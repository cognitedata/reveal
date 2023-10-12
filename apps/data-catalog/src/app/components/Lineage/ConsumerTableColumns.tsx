import styled from 'styled-components';

import { useTranslation } from '../../common/i18n';
import { CogsTableCellRenderer, Consumer } from '../../utils/types';

const LinksUl = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    margin: 0;
    padding: 0;
  }
`;

export const useConsumerTableColumns = () => {
  const { t } = useTranslation();

  const ConsumerTableColumns = [
    {
      Header: t('data-consumer_one'),
      id: 'name',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Consumer>) => {
        return <p>{record?.name ?? '--'}</p>;
      },
    },
    {
      Header: t('contact'),
      id: 'contact',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Consumer>) => {
        if (!(record.contact && record?.contact?.email)) {
          return null;
        }
        const mailtoLink = `mailto:${record.contact.email}`;
        return (
          <>
            {record.contact.email && (
              <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
                {record.contact.email}
              </a>
            )}
          </>
        );
      },
    },
    {
      Header: t('connected-links'),
      id: 'externalLinks',
      disableSortBy: true,
      Cell: ({
        row: { original: record },
      }: CogsTableCellRenderer<Consumer>) => {
        return (
          <LinksUl>
            {record.externalLinks &&
              record.externalLinks.map(({ rel, href }) => {
                if (!(rel && href)) {
                  return null;
                }
                return (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {rel}
                    </a>
                  </li>
                );
              })}
          </LinksUl>
        );
      },
    },
  ];
  return { ConsumerTableColumns };
};
