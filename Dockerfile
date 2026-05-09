FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:server

EXPOSE 8080

CMD ["node", "api/dist/server.js"]
