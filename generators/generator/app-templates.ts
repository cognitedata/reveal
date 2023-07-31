export const MARKERS = {
  MODIFY_IMPORT: `local common_apps = import '../../common/apps/main.libsonnet';`,
  MODIFY_DOMAINS: 'local application_domains_map_production = [',
  MODIFY_DOMAINS_STAGING: 'local application_domains_map_pattern = [',
  MODIFY_APP_REPOSITORY: new RegExp('(apps_repositories = {\\n\\s+# Apps)'),
  DOMAINS_IMPORT: `\nlocal common_apps = import '../../common/apps/main.libsonnet';`,
  DOMAINS_IMPORT_SECOND: `local application_apps_dict = {}`,
};

const MODIFY_DOMAINS_TEMPLATE = `
  ${MARKERS.MODIFY_DOMAINS}
  { sub_domain: '{{ name }}', domain: 'cogniteapp.com', app: '{{ name }}' }, 
`.trim();

const MODIFY_DOMAINS_STAGING_TEMPLATE = `
  ${MARKERS.MODIFY_DOMAINS_STAGING}
  { sub_domain: '{{ name }}.staging', domain: 'cogniteapp.com', app: '{{ name }}-staging' }, 
`.trim();

const DOMAINS_IMPORT_TEMPLATE = `
local {{ name }} = import './{{ name }}.libsonnet';
${MARKERS.DOMAINS_IMPORT}
`.trim();

const DOMAINS_IMPORT_SECOND_TEMPLATE = `
  ${MARKERS.DOMAINS_IMPORT_SECOND}
  + {{ name }}.application_apps_dict
`.trim();

const MODIFY_APP_REPOSITORY_TEMPLATE = `
  $1
    "{{ name }}" : local.default_run_in_cd,
`.trim();

export const TEMPLATES = {
  MODIFY_DOMAINS: MODIFY_DOMAINS_TEMPLATE,
  MODIFY_DOMAINS_STAGING: MODIFY_DOMAINS_STAGING_TEMPLATE,
  DOMAINS_IMPORT: DOMAINS_IMPORT_TEMPLATE,
  DOMAINS_IMPORT_SECOND: DOMAINS_IMPORT_SECOND_TEMPLATE,
  MODIFY_APP_REPOSITORY: MODIFY_APP_REPOSITORY_TEMPLATE,
};
