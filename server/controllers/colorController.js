const axios = require('axios');
const { Vibrant } = require('node-vibrant/node');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const TEMP_DIR = path.join(__dirname, '../uploads/temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * @desc    Extract color palette from an image
 * @route   POST /api/tools/colors
 * @access  Private (requires API key)
 */
exports.extractColors = async (req, res) => {
    try {
        const { imageUrl, colorCount = 6 } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
        }

        let imagePath = '';
        let shouldCleanup = false;

        // Check if it's a URL or base64
        if (imageUrl.startsWith('http')) {
            // Download image
            const response = await axios({
                method: 'get',
                url: imageUrl,
                responseType: 'arraybuffer',
                timeout: 10000
            });

            const filename = `temp_${Date.now()}.jpg`;
            imagePath = path.join(TEMP_DIR, filename);

            // Convert to JPEG for consistent processing
            await sharp(response.data)
                .jpeg()
                .toFile(imagePath);

            shouldCleanup = true;
        } else if (imageUrl.startsWith('data:image')) {
            // Handle base64
            const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            const filename = `temp_${Date.now()}.jpg`;
            imagePath = path.join(TEMP_DIR, filename);

            await sharp(buffer)
                .jpeg()
                .toFile(imagePath);

            shouldCleanup = true;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid image format. Provide a URL or base64 string.'
            });
        }

        // Extract colors using Vibrant
        const palette = await Vibrant.from(imagePath).getPalette();

        // Convert palette to array of colors
        const colors = [];
        const paletteNames = ['Vibrant', 'DarkVibrant', 'LightVibrant', 'Muted', 'DarkMuted', 'LightMuted'];

        paletteNames.forEach(name => {
            if (palette[name]) {
                colors.push({
                    name: name.replace(/([A-Z])/g, ' $1').trim(),
                    hex: palette[name].hex,
                    rgb: palette[name].rgb.map(c => Math.round(c)),
                    population: palette[name].population
                });
            }
        });

        // Sort by population (prominence in image)
        colors.sort((a, b) => b.population - a.population);

        // Limit to requested count
        const finalColors = colors.slice(0, parseInt(colorCount));

        // Cleanup temp file
        if (shouldCleanup && fs.existsSync(imagePath)) {
            fs.unlink(imagePath, () => { });
        }

        res.json({
            success: true,
            data: {
                colors: finalColors,
                dominant: finalColors[0] || null,
                hexCodes: finalColors.map(c => c.hex),
                cssGradient: `linear-gradient(135deg, ${finalColors.slice(0, 3).map(c => c.hex).join(', ')})`
            }
        });

    } catch (error) {
        console.error('Color extraction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to extract colors',
            error: error.message
        });
    }
};

/**
 * @desc    Generate a color scheme from a single color
 * @route   POST /api/tools/colors/scheme
 * @access  Private (requires API key)
 */
exports.generateColorScheme = async (req, res) => {
    try {
        const { baseColor, schemeType = 'complementary' } = req.body;

        if (!baseColor) {
            return res.status(400).json({
                success: false,
                message: 'Base color (hex) is required'
            });
        }

        // Parse hex to RGB
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Convert to HSL
        const hsl = rgbToHsl(r, g, b);
        const colors = [];

        switch (schemeType) {
            case 'complementary':
                colors.push(hslToHex(hsl.h, hsl.s, hsl.l));
                colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
                break;
            case 'triadic':
                colors.push(hslToHex(hsl.h, hsl.s, hsl.l));
                colors.push(hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l));
                colors.push(hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l));
                break;
            case 'analogous':
                colors.push(hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l));
                colors.push(hslToHex(hsl.h, hsl.s, hsl.l));
                colors.push(hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l));
                break;
            case 'monochromatic':
                for (let i = 0; i < 5; i++) {
                    const lightness = 20 + (i * 15);
                    colors.push(hslToHex(hsl.h, hsl.s, lightness));
                }
                break;
            default:
                colors.push(hslToHex(hsl.h, hsl.s, hsl.l));
        }

        res.json({
            success: true,
            data: {
                baseColor: baseColor,
                schemeType: schemeType,
                colors: colors,
                cssVariables: colors.map((c, i) => `--color-${i + 1}: ${c};`).join('\n')
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper functions
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
