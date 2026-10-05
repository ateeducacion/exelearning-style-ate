// Uses Playwright already installed in the eXeLearning checkout; no test runner.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:1314/';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400 && response.url().startsWith(base)) errors.push(`${response.status()} ${response.url()}`); });
  const ready = () => page.waitForFunction(() => document.querySelector('.ate-slide-footer') && [...document.querySelectorAll('.idevice_node[data-idevice-component-type="json"]')].every(node => node.classList.contains('loaded')));
  const slide = () => page.evaluate(() => {
    const main = document.querySelector('main.page').getBoundingClientRect();
    return {
      ratio: main.width / main.height,
      inside: main.top >= 0 && main.bottom <= innerHeight && main.left >= 0 && main.right <= innerWidth,
      bodyScroll: document.documentElement.scrollHeight > innerHeight + 1,
      number: document.querySelector('.ate-footer-number').textContent,
      logos: [...document.querySelectorAll('main .ate-logo-ate, main .ate-logo-gobcan')].map(img => img.complete && img.naturalWidth > 0),
      // Manual 4.7: both marks at the same height, the Gobierno de Canarias on the left.
      marks: (() => {
        const gobcan = document.querySelector('main .ate-logo-gobcan').getBoundingClientRect();
        const ate = document.querySelector('main .ate-logo-ate').getBoundingClientRect();
        return Math.abs(ate.height - gobcan.height) < 1 && gobcan.right < ate.left;
      })(),
    };
  });
  const press = async key => {
    const before = page.url();
    await page.keyboard.press(key);
    await page.waitForURL(url => url.href !== before);
    await ready();
  };
  try {
    await page.goto(base);
    await ready();
    assert.match(await page.evaluate(() => getComputedStyle(document.body).fontFamily), /^Arial/, 'Arial is the body font');
    if (process.env.ATE_SCREENSHOT) {
      await page.setViewportSize({ width: 1200, height: 700 });
      await page.reload(); await ready();
      await page.screenshot({ path: process.env.ATE_SCREENSHOT });
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.reload(); await ready();
    }
    const urls = await page.locator('#siteNav a').evaluateAll(links => links.map(link => link.href));
    assert.equal(urls.length, 11, 'The index lists every slide');
    assert.equal(await page.locator('.ate-cover-title').isVisible(), true, 'The cover shows the title');
    assert.equal(await page.locator('.ate-cover .ate-cover-marks img').count(), 2, 'The cover shows both marks');

    // Present the whole resource with the keyboard.
    for (let index = 0; index < urls.length; index++) {
      const state = await slide();
      assert(Math.abs(state.ratio - 16 / 9) < 0.02, `Slide ${index + 1} is 16:9`);
      assert(state.inside, `Slide ${index + 1} fits the window`);
      assert.equal(state.bodyScroll, false, `Slide ${index + 1} does not scroll the page`);
      assert.equal(state.number, `${index + 1} / ${urls.length}`, `Slide ${index + 1} is numbered`);
      assert.deepEqual(state.logos, [true, true], `Slide ${index + 1} shows both logos`);
      assert(state.marks, `Slide ${index + 1} has the Gobierno de Canarias and ATE marks side by side at the same height`);
      if (index) {
        assert(await page.evaluate(() => {
          const image = document.querySelector('main figure img');
          return image && new URL(image.currentSrc).pathname.endsWith('.svg') && image.naturalWidth > 0 && image.alt.trim() !== '';
        }), `Slide ${index + 1} has a loaded SVG illustration with alternative text`);
      }
      if (index < urls.length - 1) await press(index % 2 ? 'ArrowRight' : 'PageDown');
    }
    assert.equal(stripped(page.url()), stripped(urls.at(-1)), 'The keys reach the last slide');
    await press('ArrowLeft');
    assert.equal(stripped(page.url()), stripped(urls.at(-2)), 'Left goes back');
    await press('Home');
    assert.equal(stripped(page.url()), stripped(urls[0]), 'Home goes to the cover');
    await press(' ');
    assert.equal(stripped(page.url()), stripped(urls[1]), 'Space goes forward');
    await press('End');
    assert.equal(stripped(page.url()), stripped(urls.at(-1)), 'End goes to the last slide');

    // The index is a modal dialog.
    await page.locator('.ate-index').click();
    assert(await page.locator('dialog.ate-menu').evaluate(dialog => dialog.open), 'The index opens');
    assert(await page.locator('.ate-menu #packageLicense').isVisible(), 'The index shows the licence');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog.ate-menu').evaluate(dialog => dialog.open), false, 'Escape closes the index');
    await page.locator('.ate-index').click();
    await page.locator('.ate-menu #siteNav a', { hasText: 'Condensación' }).click();
    await page.waitForURL(/condensacion/); await ready();

    // Activities work inside the slides, and their keys stay theirs.
    await page.goto(urls.find(url => url.includes('verdadero'))); await ready();
    await page.locator('.TOFP-QuestionDiv').first().locator('input').first().focus();
    await page.keyboard.press('ArrowRight');
    assert.match(page.url(), /verdadero/, 'Arrow keys in a question do not change slide');
    for (const [index, value] of ['1', '0', '1', '0'].entries()) {
      await page.locator('.TOFP-QuestionDiv').nth(index).locator(`input[value="${value}"]`).check();
    }
    await page.locator('[id^="tofPCheckTest-"]').click();
    assert.equal(await page.locator('.TOFP-SolutionMessage').filter({ hasText: /Correct/i }).count(), 4, 'True/false quiz marks all answers');

    await page.goto(urls.find(url => url.includes('ordena'))); await ready();
    const options = await page.locator('.scrambled-list').evaluate(node => JSON.parse(node.dataset.ideviceJsonData).options);
    for (let i = 0; i < options.length; i++) {
      for (let attempts = 0; attempts < options.length; attempts++) {
        const items = await page.locator('.exe-sortableList-options > li').allTextContents();
        const index = items.findIndex(text => text.includes(options[i]));
        if (index === i) break;
        await page.locator('.exe-sortableList-options > li').nth(index).locator('a.up').click();
      }
    }
    await page.locator('input[class*="exe-sortableList-check-"]').click();
    assert.match(await page.locator('[id$="-feedback"]').innerText(), /Correcto|superada/i, 'Sorting exercise can be completed');

    // Phones read it as a document; nothing is wider than the screen.
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(urls[2]); await ready();
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('main.page')).aspectRatio), 'auto', `No slide frame at ${width}px`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Fits ${width}px`);
    }
    assert.deepEqual(errors, [], errors.join('\n'));
    console.log(`PASS: ${urls.length} 16:9 slides with logos and numbers presented with the keyboard, index dialog, activities and phone reading.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

function stripped(url) {
  const parsed = new URL(url);
  parsed.hash = '';
  parsed.search = '';
  return parsed.href.replace(/\/index\.html$/, '/');
}
