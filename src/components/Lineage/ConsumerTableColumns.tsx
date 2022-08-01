import { useTranslation } from 'common/i18n';
import styled from 'styled-components';
import { Consumer } from '../../utils/types';

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
      title: t('data-consumer_one'),
      key: 'name',
      render: (row: Consumer) => {
        return <p>{row?.name ?? '--'}</p>;
      },
    },
    {
      title: t('contact'),
      key: 'contact',
      render: (row: Consumer) => {
        if (!(row.contact && row?.contact?.email)) {
          return null;
        }
        const mailtoLink = `mailto:${row.contact.email}`;
        return (
          <>
            {row.contact.email && (
              <a href={mailtoLink} target="_blank" rel="noopener noreferrer">
                {row.contact.email}
              </a>
            )}
          </>
        );
      },
    },
    {
      title: t('connected-links'),
      key: 'externalLinks',
      render: (row: Consumer) => {
        return (
          <LinksUl>
            {row.externalLinks &&
              row.externalLinks.map(({ rel, href }) => {
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
