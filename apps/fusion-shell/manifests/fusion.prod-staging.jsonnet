local _ = import './fusion-app.libsonnet';

# this is identical to prod, but is deployed with out a manual judgment step in spinnaker

local namespace = 'apps';
local hostname = 'staging.fusion.cognite.com';
local hostnames = ['*.' + hostname, hostname];
local name = 'fusion-staging';
local certSecretName = 'fusion-app-prod-verification-cert-secret';
local container_image = 'eu.gcr.io/cognitedata/fusion-app';
local allow_iframe = false;
local isIAPEnabled  = false;
local subapps_import_map = "/subapps-import-map-production.json";

_.FusionApp(namespace, hostname, hostnames, name, certSecretName, container_image, 2, isIAPEnabled, allow_iframe, subapps_import_map)
