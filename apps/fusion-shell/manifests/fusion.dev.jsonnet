local _ = import './fusion-app.libsonnet';

local namespace = 'apps';
local hostname = 'dev.fusion.cogniteapp.com';
local hostnames = ['*.' + hostname, hostname];
local name = 'fusion-dev';
local certSecretName = 'fusion-app-dev-cert-secret';
local container_image = 'eu.gcr.io/cognitedata/fusion-app';
local allow_iframe = false;
local subapps_import_map = "/subapps-import-map-staging.json";

_.FusionApp(namespace, hostname, hostnames, name, certSecretName, container_image, 2, true, allow_iframe, subapps_import_map)
