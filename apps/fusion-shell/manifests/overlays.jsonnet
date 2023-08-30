local _ = import './common.libsonnet';
local clusterData = std.extVar('cluster_file');
local accountName = clusterData.name;

local rootServerConfig = |||
  server {
     listen %(LISTEN)d;

     add_header Access-Control-Allow-Origin *;

     root /usr/share/nginx/html;
     server_tokens off;
     gzip on;
     gzip_types text/plain text/css text/xml application/xml application/javascript application/json image/svg+xml;
     gzip_comp_level 5;
     gzip_proxied any;
     gzip_vary on;

     location / {
       try_files $uri /index.html;
       %(ROOT_HEADER)s
       add_header Cache-Control "max-age=300, stale-while-revalidate=600";
       add_header Strict-Transport-Security "max-age=63072000; includeSubdomains";
       add_header X-Content-Type-Options nosniff;
     }

     location ~ /subapps-import-map.json$ {
       try_files %(SUBAPPS_IMPORT_MAP)s =404;
     }

     location ~ /assets/.+\.(js|png|jpg|jpeg|map|svg|css|woff2)$ {
       expires max;
     }

     location ~ /dependencies/.+\.(js|png|jpg|jpeg|map|svg)$ {
       expires max;
     }

     location ~ \.(js|png|jpg|jpeg|map|svg)$ {
       add_header Cache-Control "max-age=300, stale-while-revalidate=3600";
     }
  }
|||;

{
  default: {
    LISTEN: 8000,
    'nginx.conf': |||
        %(APP_SERVER)s
      ||| % {
        APP_SERVER: rootServerConfig % {
          LISTEN: $.default.LISTEN,
          ROOT_HEADER: '%(ROOT_HEADER)s',
          SUBAPPS_IMPORT_MAP: '%(SUBAPPS_IMPORT_MAP)s',
        },
      },
  },
  vendors: {},
  clusters: {
    'cognitedata-production': {},
    'cognitedata-development': {},
    'openfield': {},
    'sapc-01': {},
    'okd-dev-01': {},
  },
}
