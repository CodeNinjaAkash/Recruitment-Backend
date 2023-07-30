# syntax=docker/dockerfile:1.4

FROM node:18.12.1-alpine AS base
RUN apk add --no-cache curl git
RUN npm i -g yarn --force

WORKDIR /app

FROM base AS node_modules
COPY ./ac-recruitment-backend/package.json /app/package.json
COPY ./ac-recruitment-backend/yarn.lock /app/yarn.lock
RUN yarn install --production=true

FROM base
ENV NODE_ENV='production'
COPY --from=node_modules /app/node_modules /app/node_modules
COPY ./ac-recruitment-backend/. /app
COPY ./ac-recruitment/.env.backend .env
EXPOSE 3000
CMD [ "yarn", "run", "start" ]
