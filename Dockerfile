FROM node:22.22.1-alpine3.22 AS base

WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS development

ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM base AS production

ENV NODE_ENV=production
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node src ./src
COPY --chown=node:node .env.example ./.env.example
RUN mkdir -p /usr/src/app/logs && chown -R node:node /usr/src/app
USER node
EXPOSE 4000
CMD ["node", "src/server.js"]
