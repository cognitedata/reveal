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
       add_header Content-Security-Policy-Report-Only "default-src 'self' https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* sentry.io; script-src 'self' https://fast.chameleon.io https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/ https://cdn.cogniteapp.com https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/; connect-src 'self' wss: blob: data: https: https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me/inter/inter.css https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/; object-src 'none'; child-src blob: https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*; font-src 'self' data: https://fonts.gstatic.com https://rsms.me https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://cdn.jsdelivr.net/npm/monaco-editor@0.36.1/; worker-src 'self' blob: https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*; media-src 'self' https://*.cognitedata.com https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*; form-action https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/*; img-src 'self' blob: data: https://fast.chameleon.io https://*.cognitedata.com https://auth.cognite.com https://*.preview.cogniteapp.com https://*.web.app https://*.cogniteapp.com https://storage.googleapis.com/opint-pr-server/* https://apps-cdn.cogniteapp.com; frame-src * 'self'; report-uri https://o124058.ingest.sentry.io/api/5177031/security/?sentry_key=e1b43d071a3446bfabfca7d239864bc1;";
     }

     location ~ /subapps-import-map.json$ {
       try_files %(SUBAPPS_IMPORT_MAP)s =404;
       add_header Cache-Control "max-age=0, no-cache, no-store, must-revalidate";
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
