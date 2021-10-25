import { Consumer } from '../../utils/types';

export const removeConsumerLink = (
  prev: Consumer[],
  linkIndex: number,
  consumerIndex: number
) => {
  return prev.map((p, i) => {
    if (i === consumerIndex) {
      return {
        ...p,
        externalLinks: p.externalLinks.filter((_, ind) => linkIndex !== ind),
      };
    }
    return p;
  });
};
export const updateConsumerName = (
  prev: Consumer[],
  value: string,
  consumersIndex: number
) => {
  return prev.map((consumer, index) => {
    if (consumersIndex === index) {
      return { ...consumer, name: value };
    }
    return consumer;
  });
};
export const updateConsumerContactEmail = (
  prev: Consumer[],
  value: string,
  consumersIndex: number
) => {
  return prev.map((p, index) => {
    if (consumersIndex === index) {
      return {
        ...p,
        contact: {
          ...p.contact,
          email: value,
        },
      };
    }
    return p;
  });
};
export const updateConsumerExternalLink = (
  prev: Consumer[],
  updatedLink: { name: string; id: string },
  linkIndex: number,
  consumerIndex: number
) => {
  return prev.map((p, i) => {
    if (i === consumerIndex) {
      return {
        ...p,
        externalLinks: p.externalLinks.map((link, idx) => {
          return idx === linkIndex
            ? { rel: updatedLink.name, href: updatedLink.id }
            : link;
        }),
      };
    }
    return p;
  });
};
