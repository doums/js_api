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

#### Database
this project use PostgreSQL

#### migration system
In the majority of cases Prisma can handle automatically and nicely the migrations for us.
Simply adjust the data models (`datamodel.prisma`) and run the following command (under `prisma` directory) to apply the migration:
```
prisma deploy --env-file ../.env
```
But Prisma can't do everything especially when it encounter ambiguous cases. For theses specials cases we need to write the migration scripts (`SQL`) by hand and apply it.
To do so put theses scripts in the `migrations` folder and simply run
```
npm run migrate
```
Then to sync again Prisma data models with the new changes applied to the db run
```
prisma introspect
prisma deploy --env-file ../.env
```

#### useful IPs
|     | development | production |
----- | ----------- | ---------- |
GraphQL Playground API | http://localhost:4001 | https://takapi.petitmur.beer
Playground Prisma service | http://localhost:4469 | https://takprisma.petitmur.beer
Prisma admin | http://localhost:4469/_admin | https://takprisma.petitmur.beer/_admin
pgAdmin | http://localhost:5000 | -

pgAdmin credentials
```
email: prisma
password: prisma
```

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

#### lint
```
npm run lint
```

#### serve
```
npm run serve
```
