# Base required for most things
FROM node:20-buster-slim as base

WORKDIR /opt/app

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential python dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["dumb-init", "--"]

# Development, used for development only (defaults to watch command)
FROM base as development

CMD [ "yarn", "run", "docker:watch" ]

# Build stage for production
FROM base as build

COPY ./package.json yarn.json /opt/app/

RUN yarn

COPY . /opt/app

RUN yarn tsc

# Production image used to run the bot in production, only contains node_modules & dist contents.
FROM base as production

ENV NODE_ENV production

COPY --from=build /opt/app/dist /opt/app/dist
COPY --from=build /opt/app/node_modules /opt/app/node_modules
COPY --from=build /opt/app/package.json /opt/app/package.json

CMD [ "yarn", "run", "docker:start"]
