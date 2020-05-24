FROM node:latest

WORKDIR /Outgoing

ADD . /Outgoing

RUN npm install
EXPOSE 5555
ENTRYPOINT ["node","server2.js"]
