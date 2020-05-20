FROM node:latest

WORKDIR /Outgoing

ADD . /Outgoing

EXPOSE 5555
ENTRYPOINT ["node","server2.js"]
