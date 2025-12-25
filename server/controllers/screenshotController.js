const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Store screenshots temporarily
const SCREENSHOT_DIR = path.join(__dirname, '../uploads/screenshots');

// Ensure directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

/**
 * @desc    Take a screenshot of a URL
 * @route   POST /api/tools/screenshot
 * @access  Private (requires API key)
 */
exports.takeScreenshot = async (req, res) => {
    try {
        const { url, width = 1280, height = 800, fullPage = false, format = 'png' } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, message: 'URL is required' });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid URL format' });
        }

        // Launch browser
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();

        // Set viewport
        await page.setViewport({ width: parseInt(width), height: parseInt(height) });

        // Navigate to URL with timeout
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Generate unique filename
        const filename = `screenshot_${crypto.randomBytes(8).toString('hex')}.${format}`;
        const filepath = path.join(SCREENSHOT_DIR, filename);

        // Take screenshot
        await page.screenshot({
            path: filepath,
            fullPage: fullPage === true || fullPage === 'true',
            type: format === 'jpeg' ? 'jpeg' : 'png',
            quality: format === 'jpeg' ? 80 : undefined
        });

        await browser.close();

        // Read file and convert to base64 for response
        const imageBuffer = fs.readFileSync(filepath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

        // Clean up file after 5 minutes
        setTimeout(() => {
            fs.unlink(filepath, () => { });
        }, 5 * 60 * 1000);

        res.json({
            success: true,
            data: {
                url: url,
                width: parseInt(width),
                height: parseInt(height),
                format: format,
                fullPage: fullPage === true || fullPage === 'true',
                image: `data:${mimeType};base64,${base64Image}`,
                downloadUrl: `${process.env.BASE_URL || req.protocol + '://' + req.get('host')}/uploads/screenshots/${filename}`
            }
        });

    } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to take screenshot',
            error: error.message
        });
    }
};

/**
 * @desc    Get screenshot by filename
 * @route   GET /api/tools/screenshot/:filename
 * @access  Public
 */
exports.getScreenshot = async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(SCREENSHOT_DIR, filename);

        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ success: false, message: 'Screenshot not found' });
        }

        res.sendFile(filepath);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
