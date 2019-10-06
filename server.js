const config = require("./config");
const puppeteer = require("puppeteer");
const schedule = require("node-schedule");

const main = async () => {
  let urls = [];
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://wohnungssuche.wohnberatung-wien.at/");
  await page.waitFor(config.delay);
  await page.type("#login_name", config.username);
  await page.type("#login_password", config.password);
  await page.click("#loginform button");
  await page.waitFor(config.delay);
  await page.goto("https://wohnungssuche.wohnberatung-wien.at/?page=suchprofil");
  await page.waitFor(config.delay);
  await page.click("#detailsuche-form button");
  await page.waitFor(config.delay);
  const pages = await page.evaluate(() => {
    return document.querySelectorAll(".pagination li").length - 2;
  });
  for (let index = 1; index <= pages; index++) {
    const items = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll("#wsw_planungsprojekte a.btn-primary.btn-xs").forEach(item => {
        items.push(item.href);
      });
      return items;
    });
    if (index < pages) {
      await page.click("a[aria-label='nächste Seite']");
      await page.waitFor(config.delay);
    }
    urls = urls.concat(items);
  }
  for (const url of urls) {
    await page.goto(url);
    await page.waitFor(config.delay);
    await page.click("#btnConfirmAnmeldenProjekt");
    await page.waitFor(config.delay);
  }
  await browser.close();
};

schedule.scheduleJob(config.schedule, main);
