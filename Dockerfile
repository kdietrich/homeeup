FROM node:8.11.4-alpine

WORKDIR /homeeup
COPY . /homeeup

RUN yarn install

CMD node /homeeup/bin/homeeup

EXPOSE 2001