echo "[+] Building enviroment variables"

# Get contents of example file
ENV_CONTENT=$(cat ./app/.env.build)

# Output the content into sh script
echo "#! /bin/bash
echo \"
${ENV_CONTENT}
\"" > ./env.sh

# sed replace as key=${BITBUCKET_ENV_VARIABLE:-default_value_from_example}
sed -i -E "s/^([A-Z_]+)=(.*)$/\1=\${\1:-\2}/g" ./env.sh

chmod +x ./env.sh

# Exec the env sh script and output content to .env file
./env.sh > ./.env

echo "[+] Created env file at ./.env"
