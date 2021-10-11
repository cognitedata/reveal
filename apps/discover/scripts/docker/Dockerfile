FROM node:12-alpine as build

COPY ./scripts/docker/docker-serve.sh /home/node
RUN mkdir -p /home/node/testcafe/logs/

COPY ./build /home/node/build

COPY ./scripts/docker/docker-sidecar.js /home/node/build/sidecar.js

WORKDIR /home/node

EXPOSE 3000

# default to greenfield
ENV CDF_CLUSTER 'greenfield'

# serve the site
CMD ["./docker-serve.sh"]
