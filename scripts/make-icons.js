// Renders icons/icon.svg to the PNG sizes iOS and Android want: node scripts/make-icons.js
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || require('path').join(__dirname, '../../travel-tracker/node_modules/playwright'));
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
  const page = 'file://' + path.resolve(__dirname, 'icon.html');
  for (const size of [180, 192, 512]) {
    const p = await browser.newPage({ viewport: { width: size, height: size } });
    // iOS rounds the corners itself, so icon.html fills the square.
    await p.goto(page);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.resolve(__dirname, `../icons/icon-${size}.png`) });
    await p.close();
  }
  await browser.close();
})();
