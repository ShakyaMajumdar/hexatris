FROM node:latest

WORKDIR /usr/src/hexatris

COPY package*.json .
RUN npm install

COPY . .
RUN npm build

CMD ["npm", "start"]
