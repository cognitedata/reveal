#!/bin/sh

find /usr/share/caddy/ -type f -exec sed -i "s|cdn.cogniteapp.com|${URL_PREFIX:-app}.cogniteapp.com|g" {} +
runuser -u caddy -- /usr/bin/caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
