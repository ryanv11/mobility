// Screenshot a local page with Google Chrome: node scripts/shoot.js <page> <out.png> [width] [height] [fullPage]
const { chromium } = require(process.env.PLAYWRIGHT || require('path').join(__dirname, '../../travel-tracker/node_modules/playwright'));
(async () => {
  const [page, out, w = 1000, h = 800, full = '1'] = process.argv.slice(2);
  const browser = await chromium.launch({ channel: 'chrome', args: ['--mute-audio'] });
  const p = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  p.on('console', (m) => m.type() === 'error' && console.error('CONSOLE', m.text()));
  await p.goto(page.startsWith('file:') || page.startsWith('http') ? page : 'file://' + require('path').resolve(page));
  await p.waitForTimeout(400);
  await p.screenshot({ path: out, fullPage: full === '1' });
  await browser.close();
})();
