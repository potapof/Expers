#!/bin/sh
# Установить сертификаты Минцифры, если они скачаны в /certs/
if [ -f /certs/russian_trusted_root_ca.pem ] && [ -f /certs/russian_trusted_sub_ca.pem ]; then
  cp /certs/russian_trusted_root_ca.pem /usr/local/share/ca-certificates/rt_root.crt 2>/dev/null
  cp /certs/russian_trusted_sub_ca.pem  /usr/local/share/ca-certificates/rt_sub.crt  2>/dev/null
  update-ca-certificates 2>/dev/null
  cat /certs/russian_trusted_root_ca.pem /certs/russian_trusted_sub_ca.pem > /etc/ssl/rt-ca-bundle.pem 2>/dev/null
  export NODE_EXTRA_CA_CERTS=/etc/ssl/rt-ca-bundle.pem
  echo "[certs] Russian Trusted CA installed"
fi
