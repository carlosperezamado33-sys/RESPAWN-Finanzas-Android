# Arquitectura inicial

`MainActivity` → `RespawnApp` → `MainViewModel` → `RespawnRepository` → `RespawnDbHelper` → SQLite privado.

A v0.1 evita WebView e HTML. Todo é UI Compose nativa.

A base de datos vive no sandbox privado de Android:
`/data/data/com.respawn.finanzas/databases/respawn.db`

O usuario normal non ve esa ruta nin os ficheiros internos.

Na fase documental, os PDF gardaranse no almacenamento privado da aplicación e os backups exportaranse mediante o Storage Access Framework.
