FROM node:22.14.0 AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . ./

RUN npm run build

FROM nginx:1.29.4

COPY --from=build /app/dist /usr/share/nginx/html