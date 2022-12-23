const text = `This is a test txt file.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pharetra convallis posuere morbi leo. In vitae turpis massa sed elementum. Id aliquet lectus proin nibh. Praesent semper feugiat nibh sed pulvinar proin gravida. Congue mauris rhoncus aenean vel. Egestas sed sed risus pretium quam. Eget felis eget nunc lobortis mattis aliquam. Ac tortor vitae purus faucibus ornare suspendisse sed nisi. Nulla facilisi morbi tempus iaculis. Purus gravida quis blandit turpis cursus in hac. Ipsum dolor sit amet consectetur adipiscing elit pellentesque. Habitant morbi tristique senectus et netus et malesuada. Augue eget arcu dictum varius duis at. Sodales ut eu sem integer vitae justo eget magna. Ut ornare lectus sit amet. Feugiat in ante metus dictum at. Faucibus vitae aliquet nec ullamcorper sit amet risus. Volutpat ac tincidunt vitae semper quis.

Purus gravida quis blandit turpis cursus in hac. Commodo ullamcorper a lacus vestibulum sed. Ante in nibh mauris cursus mattis molestie a. Tortor at auctor urna nunc id cursus. Tempor nec feugiat nisl pretium fusce. Ut faucibus pulvinar elementum integer enim neque volutpat ac tincidunt. Congue quisque egestas diam in arcu cursus euismod. Porttitor rhoncus dolor purus non enim praesent elementum. Et netus et malesuada fames. Laoreet suspendisse interdum consectetur libero. Eget arcu dictum varius duis at consectetur lorem donec. Arcu cursus vitae congue mauris rhoncus aenean. Interdum varius sit amet mattis. Pellentesque habitant morbi tristique senectus et netus. Lacus viverra vitae congue eu. Sit amet dictum sit amet. Arcu dui vivamus arcu felis bibendum ut tristique. Nisl purus in mollis nunc sed id.

Imperdiet nulla malesuada pellentesque elit eget gravida cum. Quis auctor elit sed vulputate mi sit. Odio ut sem nulla pharetra diam. Bibendum enim facilisis gravida neque. Semper quis lectus nulla at volutpat diam. Cras semper auctor neque vitae tempus quam pellentesque nec. Egestas congue quisque egestas diam in arcu cursus euismod. Odio tempor orci dapibus ultrices in iaculis nunc sed. Id venenatis a condimentum vitae sapien pellentesque habitant. Nulla aliquet enim tortor at auctor. Placerat duis ultricies lacus sed turpis tincidunt id. Amet consectetur adipiscing elit pellentesque.

Etiam sit amet nisl purus in mollis nunc sed id. Arcu risus quis varius quam quisque id diam vel. Amet venenatis urna cursus eget nunc scelerisque viverra. Volutpat odio facilisis mauris sit amet massa vitae. Neque sodales ut etiam sit amet nisl purus. Sed blandit libero volutpat sed. Velit scelerisque in dictum non consectetur a erat. At risus viverra adipiscing at in tellus. Dolor magna eget est lorem ipsum dolor sit. Et molestie ac feugiat sed lectus vestibulum. Vestibulum mattis ullamcorper velit sed ullamcorper morbi tincidunt. Id faucibus nisl tincidunt eget nullam non nisi est. Ac odio tempor orci dapibus ultrices in iaculis.

Turpis in eu mi bibendum neque egestas congue quisque. Lobortis mattis aliquam faucibus purus in massa tempor nec. Orci nulla pellentesque dignissim enim sit amet venenatis. Quisque sagittis purus sit amet volutpat consequat mauris. Sagittis nisl rhoncus mattis rhoncus urna. Sit amet aliquam id diam maecenas ultricies mi eget mauris. Scelerisque eleifend donec pretium vulputate sapien nec. Quisque egestas diam in arcu cursus euismod. Non blandit massa enim nec dui nunc mattis enim ut. Est velit egestas dui id ornare arcu odio ut sem. Amet nisl suscipit adipiscing bibendum est. Magnis dis parturient montes nascetur. Egestas pretium aenean pharetra magna ac. Duis convallis convallis tellus id interdum velit. Ultrices neque ornare aenean euismod elementum nisi quis eleifend quam. Facilisis sed odio morbi quis commodo. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper. Mi bibendum neque egestas congue. At in tellus integer feugiat scelerisque. Ac turpis egestas sed tempus.
`;

export const mockTxt = URL.createObjectURL(
  new Blob([text], {
    type: 'text/plain',
  })
);

const csv = `Age group;Population;Change in percentage (2012-2022)
0 year;56 458;-6,6
1-5 year;284 235;-8,9
6-12 year;444 234;4,5
13-15 year;196 144;2,4
16-19 year;253 663;-2,3
20-44 year;1 800 011;5,7
45-66 year;1 519 562;10,2
67-79 year;630 670;45,6
80-89 year;193 735;6,7
90 year or older;46 558;16,6
`;

export const mockCsv = URL.createObjectURL(
  new Blob([csv], {
    type: 'text/csv',
  })
);

const json = `{
  "container": {
  "type": "row",
  "shouldRenderCompactly": true,
  "children": [
  {
  "type": "text",
  "id": "d11",
  "url": "./mockTxt",
  "width": 500,
  "label": "TextContainer"
  },
  {
  "type": "text",
  "id": "d12",
  "url": "./mockCsv",
  "width": 500,
  "label": "TextContainer with CSV"
  },
  {
  "type": "text",
  "id": "d13",
  "url": "./mockJson",
  "width": 500,
  "label": "TextContainer with JSON"
  }
  ]
  }
  }
  `;

export const mockJson = URL.createObjectURL(
  new Blob([json], {
    type: 'application/json',
  })
);
