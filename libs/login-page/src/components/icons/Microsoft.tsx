import React from 'react';

export function Microsoft() {
  return React.createElement(
    'svg',
    {
      xmlnsXlink: 'http://www.w3.org/1999/xlink',
      role: 'img',
      viewBox: '0 0 16 16',
      width: '16',
      height: '16',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
    },
    React.createElement('path', {
      d: 'M7.5 1H1v6.5h6.5V1Z',
      fill: '#F25022',
    }),
    React.createElement('path', {
      d: 'M7.5 8.5H1V15h6.5V8.5Z',
      fill: '#00A4EF',
    }),
    React.createElement('path', {
      d: 'M15 1H8.5v6.5H15V1Z',
      fill: '#7FBA00',
    }),
    React.createElement('path', {
      d: 'M15 8.5H8.5V15H15V8.5Z',
      fill: '#FFB900',
    })
  );
}
