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

// TODO CDFUX-1573 - figure out translation
export const ConsumerTableColumns = [
  {
    title: 'Data consumer',
    key: 'name',
    render: (row: Consumer) => {
      return <p>{row?.name ?? '--'}</p>;
    },
  },
  {
    title: 'Contact',
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
    title: 'Connected links',
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
