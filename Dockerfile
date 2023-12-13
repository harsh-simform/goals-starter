FROM node:16 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 5000

CMD [ "npm", "run", "dev" ]