#!/bin/bash 

APP_USER="$(whoami)"

create_tmpfile() {
  local dir_temp_prefix="/tmp"
  mkdir -p ${dir_temp_prefix}
  local tmpfile="$(mktemp -p ${dir_temp_prefix} -t ${APP_USER}.${APP_USER_GID}XXXXXXXXXXXXXXXXX 2>/dev/null)"

  if [ -f ${tmpfile} ]; then
    echo "${tmpfile}"
  else
    log "ERROR" "Can't create temp file: ${tmpfile}, exiting..."
    exit 1
  fi
}

ZIP_FILE=$(ls /drone/src/artifacts/*zip)

if [ ! -f $ZIP_FILE ]; then
  echo "[ERROR] No such file $ZIP_FILE"
  exit 1
fi

ACCESS_TOKEN=$(curl https://accounts.google.com/o/oauth2/token -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}&grant_type=refresh_token&redirect_uri=urn:ietf:wg:oauth:2.0:oob" | jq -r .access_token)

response_file="$(create_tmpfile)"
#request_cmd="curl --write-out %{http_code} -s -f --output $response_file -H 'Authorization: Bearer ${ACCESS_TOKEN}' -H 'x-goog-api-version: 2' -X PUT -T $ZIP_FILE https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APPLICATION_ID}"
curl --write-out %{http_code} -s -f -H "Authorization: Bearer ${ACCESS_TOKEN}" -H 'x-goog-api-version: 2' -X PUT -T $ZIP_FILE "https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APPLICATION_ID}"
request_cmd="curl --write-out %{http_code} -s -f -H \"Authorization: Bearer ${ACCESS_TOKEN}\" -H 'x-goog-api-version: 2' -X PUT -T $ZIP_FILE https://www.googleapis.com/upload/chromewebstore/v1.1/items/${APPLICATION_ID}"
#response_code=$(${request_cmd} || echo)

if [[ $response_code =~ ^(5[0-9][0-9]|4[0-9][0-9])$ ]]; then
  echo "[ERROR] Response code is $response_code"
  exit 1
else
  echo "[INFO] Response code is $response_code"
fi

if [ -f "$response_file" ]; then
  echo "Response file: $response_file"
  cat $response_file
fi

