import _ from "lodash";
import puppeteer from "puppeteer";
import fastly from "../../data/providers/fastly.js";

const spotter = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://status.fastly.com/");
  const data = await page.$eval(
    "body > div.layout-content.status.status-index.starter > div.container > div.components-section.font-regular",
    e => e.innerHTML
  );
  browser.close();
  return data;
};

spotter()
  .then(value => value.match(/\((.{3})\)/gm).map(x => x.slice(1, -1)))
  .then(a =>
    a.map(x => {
      // hardcoding LON to LGW
      if (x === "LON") return "LGW";
      else return x;
    })
  )
  .then(a =>
    a.map(x => {
      // hardcoding WDC to LEE
      if (x === "WDC") return "LEE";
      else return x;
    })
  )
  .then(extracted => {
    if (_.isEqual(extracted.sort(), fastly.pops)) {
      console.log("fastly:success", extracted.length - fastly.pops.length);
    } else {
      console.log(
        "fastly:error",
        extracted.filter(e => !fastly.pops.includes(e))
      );
      throw new Error("Possible new PoP");
    }
  });
