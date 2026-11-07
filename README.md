# Mausoleo

Libro de contas do fogar para Android. Funciona sen conexión: os datos gárdanse no teléfono e só saen del cando ti exportas unha copia.

- Paquete: `gal.mausoleo.contas` (instálase á parte da versión anterior, `gal.mausoleo.finanzas`).
- Android 8.0 ou superior.

## Pasar os datos da app anterior

O paquete é novo, así que a app empeza cos datos de referencia do 05/11/2026. Para traer os teus datos actuais:

1. Na app vella: botón de copia → garda o ficheiro `MAUSOLEO_PUNTO_CERO_….json`.
2. Na app nova: Máis → Axustes → **Restaurar ZIP / JSON** e escolle ese ficheiro.
3. Comproba saldos e movementos antes de desinstalar a app vella.

## Estrutura

```
app/src/main/assets/www/   app web (index.html, css/app.css, js/app.js)
app/src/main/java/…        contedor WebView: serve os ficheiros locais, gardar/abrir copias, botón Atrás
.github/workflows/apk.yml  compila o APK en GitHub Actions
```

`js/app.js` contén toda a lóxica (contas, débedas, libro mensual, copias). O formato das copias e a chave de `localStorage` son os mesmos da versión anterior, polo que as copias son compatibles.

## Compilar

```
gradle assembleRelease
```

Fai falta o SDK de Android 35. Sen chave propia, o APK asínase coa chave de depuración do equipo; para que as actualizacións se instalen enriba da versión anterior, usa sempre a mesma chave:

```
MAUSOLEO_KEYSTORE=/ruta/mausoleo.jks MAUSOLEO_KEYSTORE_PASSWORD=… gradle assembleRelease
```

En GitHub Actions, garda a chave en base64 no segredo `MAUSOLEO_KEYSTORE_B64` e o contrasinal en `MAUSOLEO_KEYSTORE_PASSWORD`.
