FROM node:6.10.3

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
COPY . /usr/src/app

# build the project
RUN npm run build

# Set env
ENV API_ENDPOINT="192.168.0.48" \
    API_PORT="5000"

EXPOSE 3000

CMD [ "npm", "run", "start" ]


