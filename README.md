## COOLCHAT69

###### :cloud: api built in GraphQL :cloud:


#### download
```
git clone https://github.com/doums/js_api.git
```

#### prerequisites
- docker
- node (npm)

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

#### useful IPs
|     | development | production |
----- | ----------- | ---------- |
GraphQL Playground API | http://localhost:4000 | https://takapi.petitmur.beer
Playground Prisma service | http://localhost:4469 | https://takprisma.petitmur.beer
Prisma admin | http://localhost:4469/_admin | https://takprisma.petitmur.beer/_admin
pgAdmin | http://localhost:5000 | https://takpgAdmin.petitmur.beer

#### generate a token access for Prisma service
in `prisma` directory
```
prisma token --env-file ../.env
```

#### set a token for the Prisma service's Playground
add this in HTTP headers section (replace `token` by a valid token generated as explained above)
```
{
  "Authorization": "Bearer token"
}
```

#### build for production
```
npm run build
```

#### serve
```
npm run serve
```
