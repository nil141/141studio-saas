#!/usr/bin/env bash
# Genera la carpeta publish/ con la web pública estática lista para subir.
# landing.html se publica como index.html (página de inicio del dominio).
set -euo pipefail
cd "$(dirname "$0")"

rm -rf publish
mkdir -p publish/assets publish/avatars publish/clients

# landing como página de inicio
cp landing.html publish/index.html
# contacto con los enlaces de "volver" apuntando a la raíz del dominio
sed 's|href="landing.html"|href="/"|g' contact.html > publish/contact.html

# recursos sueltos
cp favicon.svg logo.svg redonda.svg publish/
cp assets/campanas-img.avif publish/assets/
cp avatars/av1.avif avatars/av2.avif avatars/av3.avif avatars/av4.avif avatars/av5.avif avatars/av6.avif avatars/av7.avif publish/avatars/
cp clients/c1-2.jpg clients/c2-2.jpg clients/c3-2.jpg clients/c4-2.jpg clients/c5-2.jpg clients/c6-2.jpg publish/clients/

echo "publish/ generado:"
find publish -type f | sort
