FROM node:latest

WORKDIR /usr/src/hexatris

COPY package*.json .
RUN npm install

COPY . .

CMD ["npm", "start"]


