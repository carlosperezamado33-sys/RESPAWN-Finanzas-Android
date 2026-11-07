plugins {
    id("com.android.application")
}

// Sinatura estable para poder instalar actualizacións enriba da versión anterior.
// A chave non vai no repositorio: lese das variables de contorno (segredos de GitHub
// ou o teu equipo). Sen elas, a compilación usa a chave de depuración.
val keystorePath: String? = System.getenv("MAUSOLEO_KEYSTORE")
val hasReleaseKey = keystorePath != null && file(keystorePath).exists()

android {
    namespace = "gal.mausoleo.contas"
    compileSdk = 35

    defaultConfig {
        applicationId = "gal.mausoleo.contas"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        if (hasReleaseKey) {
            create("release") {
                storeFile = file(keystorePath!!)
                storePassword = System.getenv("MAUSOLEO_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("MAUSOLEO_KEY_ALIAS") ?: "mausoleo"
                keyPassword = System.getenv("MAUSOLEO_KEY_PASSWORD") ?: System.getenv("MAUSOLEO_KEYSTORE_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (hasReleaseKey) signingConfigs.getByName("release") else signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
