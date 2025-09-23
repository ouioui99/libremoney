FROM node:22.14.0-bullseye

WORKDIR /myapp

COPY . .

RUN apt update && apt install -y bash

RUN yarn global add expo

RUN yarn install

CMD yarn start