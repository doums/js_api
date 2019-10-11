## COOLCHAT69

###### :cloud: api built in GraphQL :cloud:


#### download
```
git clone https://github.com/doums/js_api.git
```

#### installation
```
npm i
npm i -g prisma
```
in `prisma` directory
```
docker-compose up -d
prisma deploy --env-file ../.env
```

#### run for development
```
npm start
```

#### migration
in `prisma` directory
```
prisma deploy --env-file ../.env
```

#### generate a token access to Prisma server
in `prisma` directory
```
prisma token --env-file ../.env
```

#### build for production
```
npm run build
```

#### serve
```
npm run serve
```
