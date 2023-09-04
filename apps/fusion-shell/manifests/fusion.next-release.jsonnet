local _ = import './fusion-app.libsonnet';

local namespace = 'apps';
local hostname = 'next-release.fusion.cognite.com';
local hostnames = ['*.' + hostname, hostname];
local name = 'fusion-next-release';
local certSecretName = 'fusion-app-staging-cert-secret';
local container_image = 'eu.gcr.io/cognitedata/fusion-app';
local allow_iframe = true;
local subapps_import_map = "/subapps-import-map-preview.json";

_.FusionApp(namespace, hostname, hostnames, name, certSecretName, container_image, 2, true, allow_iframe, subapps_import_map)
