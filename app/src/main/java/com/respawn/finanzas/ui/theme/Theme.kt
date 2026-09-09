package com.respawn.finanzas.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.shape.RoundedCornerShape

enum class RespawnThemeMode { OBSIDIAN, IVORY }

private val Obsidian = darkColorScheme(
    primary = Color(0xFFD8B85F),
    onPrimary = Color(0xFF17140C),
    primaryContainer = Color(0xFF2B2517),
    onPrimaryContainer = Color(0xFFFFE5A2),
    secondary = Color(0xFF67D5A5),
    onSecondary = Color(0xFF082016),
    secondaryContainer = Color(0xFF142A21),
    onSecondaryContainer = Color(0xFFB9F3D9),
    tertiary = Color(0xFFE49363),
    onTertiary = Color(0xFF2C160A),
    background = Color(0xFF090A0B),
    surface = Color(0xFF111315),
    surfaceVariant = Color(0xFF191C1F),
    onBackground = Color(0xFFF4F1E9),
    onSurface = Color(0xFFF4F1E9),
    onSurfaceVariant = Color(0xFFC8C5BD),
    outline = Color(0xFF55585B),
    error = Color(0xFFFF7168),
    onError = Color(0xFF2D0906)
)

private val Ivory = lightColorScheme(
    primary = Color(0xFF756024),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFF1E5BC),
    onPrimaryContainer = Color(0xFF28200A),
    secondary = Color(0xFF26785A),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFD6EFE2),
    onSecondaryContainer = Color(0xFF0D2A1E),
    tertiary = Color(0xFF9A5A35),
    onTertiary = Color(0xFFFFFFFF),
    background = Color(0xFFF3F2ED),
    surface = Color(0xFFFFFEFA),
    surfaceVariant = Color(0xFFECEAE3),
    onBackground = Color(0xFF1B1C1D),
    onSurface = Color(0xFF1B1C1D),
    onSurfaceVariant = Color(0xFF5E5E59),
    outline = Color(0xFFC6C3B9),
    error = Color(0xFFBA1A1A),
    onError = Color(0xFFFFFFFF)
)

private val BuracoTypography = Typography(
    displaySmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Black,
        fontSize = 34.sp,
        letterSpacing = (-0.6).sp
    ),
    headlineSmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.ExtraBold,
        fontSize = 23.sp,
        letterSpacing = (-0.25).sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.ExtraBold,
        fontSize = 20.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 16.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontSize = 16.sp,
        lineHeight = 22.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontSize = 14.sp,
        lineHeight = 20.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 11.sp,
        letterSpacing = 0.45.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 10.sp,
        letterSpacing = 0.35.sp
    )
)

private val BuracoShapes = Shapes(
    extraSmall = RoundedCornerShape(10.dp),
    small = RoundedCornerShape(14.dp),
    medium = RoundedCornerShape(20.dp),
    large = RoundedCornerShape(26.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

@Composable
fun RespawnTheme(
    mode: RespawnThemeMode,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (mode == RespawnThemeMode.OBSIDIAN) Obsidian else Ivory,
        typography = BuracoTypography,
        shapes = BuracoShapes,
        content = content
    )
}
