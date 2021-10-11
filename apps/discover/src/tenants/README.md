## Custom tenant data

Why is this here?

Well, we did discuss trying to put it (`layers`) into firebase. But because the data is so unstructred and complex it is not a good fit.

Then after that we refactored out some other tenant settings and have put them into the `config`, now while these are a better fit for firebase, it's not worth splitting it up.

The other reason for this is that we cannot at the moment deploy a new tenant without deploying the application (config for firebase is in this project), so it will not save us on that front anyway. With these two issues in mind, we settled on leaving it in here.


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
