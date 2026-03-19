Create .env file with following fields:
```
DB_PASSWORD=
ADMIN_PASSWORD=
SITE_NAME=
GAMARG_IMAGE=gamarg:latest
```
Run
```
source .env

docker build -t ${GAMARG_IMAGE} -f gamarg.Dockerfile

docker compose up -d

docker compose exec backend bench new-site ${SITE_NAME} \                                                                                 1m 36s
  --db-root-password ${DB_PASSWORD} \
  --admin-password ${ADMIN_PASSWORD} \
  --install-app general_activity_manager
```
