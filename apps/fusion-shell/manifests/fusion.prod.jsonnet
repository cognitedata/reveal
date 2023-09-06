local _ = import './fusion-app.libsonnet';

local namespace = 'apps';
local hostname = 'fusion.cognite.com';
local hostnames = ['*.' + hostname, hostname];
local name = 'fusion';
local certSecretName = 'fusion-app-prod-cert-2-secret';
local container_image = 'eu.gcr.io/cognitedata/fusion-app/prod';
local allow_iframe = false;
local subapps_import_map = "/subapps-import-map-production.json";

_.FusionApp(namespace, hostname, hostnames, name, certSecretName, container_image, 2, false, allow_iframe, subapps_import_map)
