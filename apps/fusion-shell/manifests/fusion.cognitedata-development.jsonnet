local _ = import './fusion-app.libsonnet';

local namespace = 'apps-staging';
local hostname = 'fusion.cognitedata-development.cognite.ai';
local hostnames = ['*.' + hostname, hostname];
local name = 'fusion-app-staging';
local certSecretName = 'fusion-app-staging-cert-secret';
local container_image = 'eu.gcr.io/cognitedata-development/fusion-app/dev:latest';
local allow_iframe = false;
local subapps_import_map = "/subapps-import-map-staging.json";

_.FusionApp(namespace, hostname, hostnames, name, certSecretName, container_image, 2, true, allow_iframe, subapps_import_map)
