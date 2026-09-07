# Compilar RESPAWN en GitHub Actions

O proxecto inclúe `.github/workflows/build-apk.yml`.

Ao subilo a un repositorio GitHub:
1. A workflow execútase en `main` e tamén manualmente.
2. Usa Java 17.
3. Instala Android SDK/API 37 e Build Tools 36.0.0.
4. Acepta as licenzas do SDK.
5. Usa Gradle 9.6.0.
6. Executa `assembleDebug`.
7. Publica como artefacto:
   - `RESPAWN_FINANZAS_0.2.apk`
   - `RESPAWN_FINANZAS_0.2.apk.sha256`

O APK debug é instalable directamente en Android habilitando a instalación
desde a fonte usada para abrir o ficheiro.
