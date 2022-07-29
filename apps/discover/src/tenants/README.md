## Custom tenant data

Why is this here?

It should live in project config, we need to confirm everything is there

## CORS for your buckets

https://cloud.google.com/storage/docs/configuring-cors

To set:

```
gsutil cors set cors-config.json gs://discover_layers_us
```

To check:

```
gsutil cors get gs://discover_layers_us
```

Then set the bucket as public:

```
gsutil -m acl set -R -a public-read gs://discover_layers_us
gsutil defacl set public-read gs://discover_layers_us
```

Existing Config Structure

```
general
     |- sideBar
     |- searchableLayerTitle
     |- hideFilterCount
     |- showDynamicResultCount
     |- companyInfo
         |- name
         |- logo
  map
     |- zoom
     |- center
     |- cluster
  azureConfig
     |- enabled
     |- instrumentationKey
     |- options
         |-enableDebug
         |-loggingLevelConsole
         |-loggingLevelTelemetry
         |-enableAutoRouteTracking
         |-enableAjaxPerfTracking
         |-autoTrackPageVisitTime
  documents
     |- disabled
     |- defaultLimit
     |- extractByFilepath
     |- wellboreSchematics
     |- showGeometryOnMap
  wells
     |- disabled
     |- overview
         |- enabled
     |- ppfg
         |- enabled
         |- tvdColumn
         |- defaultCurves
     |- geomechanic
         |- enabled
     |- trajectory
         |- enabled
         |- normalizeColumns
         |- columns
         |- charts
         |- queries
     |- logs
         |- enabled
         |- types
         |- queries
         |- tracks
     |- fit
         |- enabled
         |- fieldInfo
     |- lot
         |- enabled
         |- fieldInfo
     |- digitalRocks
         |- enabled
         |- metaInfo
     |- casing
         |- enabled
     |- nds
         |- enabled
     |- npt
         |- enabled
     |- nds_filter
         |- enabled
     |- npt_filter
         |- enabled
     |- data_source_filter
         |- enabled
     |- measurements_filter
         |- enabled
     |- field_block_operator_filter
         |- field
             |- enabled
         |- operator
             |- enabled
         |- block
              |- enabled
     |- well_characteristics_filter
         |- well_type
             |- enabled
         |- kb_elevation
             |- enabled
         |- tvd
             |- enabled
         |- maximum_inclination_angle
             |- enabled
         |- spud_date
             |- enabled
         |- water_depth
             |- enabled
  seismic
     |- disabled
     |- metadata
```

Complex attributes

```
  array based
     |- map => layers
     |- wells => trajectory => charts
     |- wells => trajectory => charts
  fetch based
     | - wells => ppfg => fetch
     | - wells => wellbores => fetch
     | - wells => geomechanic => fetch
     | - wells => fit => fetch
     | - wells => lot => fetch
     | - wells => digitalRocks => fetch
     | - wells => digitalRocks => digitalRockSampleFetch
     | - wells => digitalRocks => gpartFetch
  data based options
     |-  externalLinks
     |-  map => layers
     |-  documents => filters
     |-  wells => trajectory => charts
     |-  wells => trajectory => columns
     |-  wells => trajectory => queries
```
