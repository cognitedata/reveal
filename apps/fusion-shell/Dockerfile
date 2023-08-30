FROM nginxinc/nginx-unprivileged:1.23.3-alpine
USER root
RUN apk -U upgrade
USER 101
ARG APP_FOLDER
COPY $APP_FOLDER /usr/share/nginx/html
