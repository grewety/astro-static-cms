# https://docs.docker.com/get-started/06_bind_mounts/
# https://caiomsouza.medium.com/fix-for-powershell-script-not-digitally-signed-69f0ed518715
docker volume create nodemodulescache
docker volume create pnpmstore
docker volume create dist
docker run -it -w /app --name buildastrostaticcms -v dist:/app/dist -v nodemodulescache:/app/node_modules -v pnpmstore:/app/.pnpm-store --mount type=bind,source="$(pwd)",target=/app node:16.12-alpine sh -c "npm -g install pnpm@7.9.5 && pnpm install && pnpm run build"
docker container rm buildastrostaticcms

