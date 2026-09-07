package com.respawn.finanzas.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.compose.material3.Typography

enum class RespawnThemeMode { OBSIDIAN, IVORY }

private val Obsidian = darkColorScheme(
    primary = Color(0xFFF2B90F),
    onPrimary = Color(0xFF111111),
    secondary = Color(0xFF20D878),
    tertiary = Color(0xFFFF7A72),
    background = Color(0xFF090B0D),
    surface = Color(0xFF15191C),
    surfaceVariant = Color(0xFF1D2226),
    onBackground = Color(0xFFF2EFE7),
    onSurface = Color(0xFFF2EFE7),
    outline = Color(0xFF3A4146),
    error = Color(0xFFF04F46)
)

private val Ivory = lightColorScheme(
    primary = Color(0xFFE0A400),
    onPrimary = Color(0xFF181818),
    secondary = Color(0xFF0EBF63),
    tertiary = Color(0xFFED493F),
    background = Color(0xFFF1EDE4),
    surface = Color(0xFFFFFDF8),
    surfaceVariant = Color(0xFFF0ECE3),
    onBackground = Color(0xFF222628),
    onSurface = Color(0xFF222628),
    outline = Color(0xFFC9C2B6),
    error = Color(0xFFED493F)
)

private val RespawnTypography = Typography(
    displaySmall = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.ExtraBold,
        fontSize = 32.sp
    ),
    headlineSmall = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Bold,
        fontSize = 16.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontSize = 16.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontSize = 14.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.SemiBold,
        fontSize = 12.sp
    )
)

@Composable
fun RespawnTheme(
    mode: RespawnThemeMode,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (mode == RespawnThemeMode.OBSIDIAN) Obsidian else Ivory,
        typography = RespawnTypography,
        content = content
    )
}
