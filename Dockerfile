# Utiliser l'image de node definie dans le .nvmrc
FROM node:18.12.1

RUN mkdir -p /usr/src/
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g cross-env

RUN npm install

COPY . .

EXPOSE ${API_PORT}

CMD ["npm", "run", "dev"]
