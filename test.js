const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(1000); // let the game run for 1s
  
  const htmlUI = await page.$eval('#html-ui', el => el.innerHTML);
  console.log('HTML-UI LENGTH:', htmlUI.length);
  if (htmlUI.length < 100) {
     console.log('HTML-UI CONTENT:', htmlUI);
  } else {
     console.log('HTML-UI has content, first 100 chars:', htmlUI.substring(0, 100));
  }
  
  const gState = await page.evaluate(() => typeof window.G !== 'undefined' ? window.G.state : 'NO G');
  console.log('G.state:', gState);
  
  const uiFunc = await page.evaluate(() => typeof window.updateHTMLUI);
  console.log('typeof updateHTMLUI:', uiFunc);
  
  await browser.close();
})();
