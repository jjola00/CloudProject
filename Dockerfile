FROM node:14

WORKDIR /app

# Copies package.json and package-lock.json files
COPY package.json ./
COPY package-lock.json ./

RUN npm install

# This copies the rest of the application code
COPY . .

EXPOSE 3002

CMD ["node", "server.js"]
