FROM node:18-alpine as BUILD_IMAGE

WORKDIR /app

COPY package.json yarn.lock ./

RUN \
    --mount=type=cache,target=/var/cache/apt \
    yarn  

COPY . .

EXPOSE 2000

CMD ["node", "app.mjs"]
