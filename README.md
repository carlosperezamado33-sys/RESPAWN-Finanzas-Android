# RESPAWN // FINANZAS — Android nativo 0.2

Segunda entrega da aplicación Android nativa.

## Xa funciona
- Kotlin + Jetpack Compose.
- OBSIDIAN / IVORY.
- SQLite privado.
- Dashboard.
- Lista e buscador de débedas.
- Alta de débeda.
- Pagamentos parciais.
- SALDADA / REABRIR.
- **Importador do backup completo da versión PC/USB**.

## Importador PC → Android
En `MÁIS > IMPORTAR RESPAWN DESDE PC` podes seleccionar:

`RESPAWN_BACKUP_COMPLETO_....json`

A importación:
- valida `app = RESPAWN_DEBEDAS`;
- importa débedas activas;
- conserva a papeleira como rexistros ocultos;
- importa pagamentos;
- importa o Caderno;
- descodifica os PDF/base64;
- garda os PDF no espazo privado da app;
- conserva o JSON rico de cada débeda e nota en `extra_json`;
- importa OBSIDIAN/IVORY cando está no backup.

## Seguinte fase
1. Visor/arquivo PDF dentro da ficha dunha débeda.
2. Caderno visible e editábel.
3. Backup Android → PC.
4. Alertas + calendario.
5. Biometría.
6. Plan / simulador / Saúde dos datos.

## Compilación
Configuración:
- compileSdk 37
- targetSdk 37
- AGP 9.4.0
- Compose BOM 2026.08.00
- JDK 17 compatible (o proxecto define Java 17)

Esta contorna non trae o Android SDK preinstalado, polo que aquí aínda non se xerou o APK.
