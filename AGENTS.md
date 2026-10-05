# ATE

- `theme/` es la fuente del estilo; la raíz es el ejemplo ELPX descomprimido.
- No modificar eXeLearning, la skill documentos-ate ni los otros repositorios de estilos para arreglar ATE.
- La imagen sale del `DESIGN.md` de la skill documentos-ate: Arial, azul `#3F4D88`, azul claro
  `#DDE1EE`, amarillo `#E7B012` sólo en el filete del pie, sin degradados ni sombras.
- Los logotipos siguen el manual del Gobierno de Canarias (4.7 y 4.4): banda superior de
  6 + 12 + 6 mm con el Gobierno de Canarias y sus niveles emisores a la izquierda y el ATE a la
  derecha, a la misma altura (como en los documentos del ATE); en la portada, la Marca sola y el
  ATE centrados entre Y/4 e Y/2,
  separados Y/8. 1 mm = 0,2953 cqw en la diapositiva 16:9.
- Los logotipos de `theme/img/` se copian tal cual de la skill: no deformarlos ni recolorearlos.
  No están cubiertos por la GPL.
- `style.js` añade `html.ate-js` en el `<head>`; la diapositiva 16:9 sólo se aplica con esa clase y
  en pantallas anchas y apaisadas. Sin JavaScript, en móvil o al imprimir, el contenido es un documento.
- La diapositiva es el propio `main.page`, escalado con unidades `cqw`; no usar `transform: scale`,
  que descoloca las actividades de arrastrar. Mover nodos, no clonar ni reescribir iDevices.
- El teclado no cambia de diapositiva dentro de campos de formulario, y la barra espaciadora pulsa
  el enlace o botón enfocado.
- Los iconos se regeneran con `python3 scripts/color_icons.py /ruta/a/exelearning/public/files/perm/themes/base/zen/icons`;
  después hay que reexportar el ejemplo.
- `python3 scripts/package.py` reconstruye ambos paquetes y el manifiesto de descarga.
- Validar con `python3 scripts/check.py` y `NODE_PATH=/ruta/a/exelearning/node_modules node scripts/check-browser.cjs`.
- Para regenerar el HTML del ejemplo, usar el CLI de eXeLearning desde su propio directorio:
  `bun dist/cli.js elp:export /ruta/al/ciclo-del-agua.elpx /tmp/ate elpx` y copiar
  `index.html`, `html/` y `search_index.js` (no el `content.xml`, que añade la captura en base64).
- El repositorio y el estilo son GPL-3.0 (`LICENSE` es el texto íntegro para que GitHub lo detecte);
  los iconos, Apache 2.0; el material didáctico, CC0; los logotipos, marcas institucionales.
