# Importación PC → Android

Formato admitido:
`RESPAWN_BACKUP_COMPLETO_*.json`

Raíz:
- `app = "RESPAWN_DEBEDAS"`
- `debts`
- `trash`
- `settings`
- `generalNotes`
- `files`

Os pagamentos están en `debts[].payments`.

Os PDF están no backup PC como `dataURL` base64. Android:
1. descodifica o base64;
2. crea ficheiros no sandbox privado;
3. rexistra os metadatos na táboa `documents`.

Para non perder campos da versión PC aínda non modelados visualmente,
cada débeda e nota conserva tamén o JSON completo en `extra_json`.
