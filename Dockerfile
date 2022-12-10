FROM node:18 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY src/ src/
COPY tsconfig.json .
RUN npm install --quit
RUN npm run build

FROM node:18
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
COPY src/ src/
COPY tsconfig.json .
RUN ls -al
RUN npm ci --production --quit
COPY --from=builder /usr/src/app/dist/ dist/
USER node
ENTRYPOINT ["node", "dist/http-server.js"]