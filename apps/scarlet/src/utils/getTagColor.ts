export const getTagColor = (tag: string) =>
  ({
    PCMS: 'purple',
    U1: 'midblue',
    PVAR: 'lightblue',
    Nameplate: 'pink',
    Miscellaneous: 'midorange',
    'Mech Drawing': 'yellow',
    U2: 'success',
  }[tag] || '#xxxxxx');
