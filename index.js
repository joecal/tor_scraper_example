const exec = require('child_process').exec;
const path = require('path');
const agents = require(path.join(__dirname, 'agents.js'));
const jsonexport = require('jsonexport');
const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const HeadlessChrome = require('simple-headless-chrome');
const browser = new HeadlessChrome({
    headless: false, // Keep false
    chrome: {
      flags: [
        '--proxy-server=socks5://127.0.0.1:9050',
        '--user-agent=' + randomAgent()
      ]
    }
    });

function randomAgent() {
  let randomNumber = Math.floor(Math.random()*agents.length);
  return agents[randomNumber];
}

console.log('Starting tor')
exec("tor",
  (error, stdout, stderr) => {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
         console.log('exec error: ' + error);
    }
  }
);

async function main() {

  try {

    console.log("Opening browser")
    await browser.init()

    console.log("Setting private tab")
    const mainTab = await browser.newTab({ privateTab: false }) // Keep false

    console.log("Navigate to http://www.whatsmyip.org to check ip")
    await mainTab.goTo('http://www.whatsmyip.org')

    console.log("Wait 5 seconds")
    await mainTab.wait(5000)

    console.log("Close browser")
    await mainTab.close(true)
    await browser.close(true)

    console.log('Change ip')
    await exec("(echo authenticate \u0039\u0034\u0034\u0039; echo signal newnym; echo quit) | nc localhost 9051",
      (error, stdout, stderr) => {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }
      }
    )

    console.log("Opening browser")
    await browser.init()

    console.log("Setting private tab")
    const newTab = await browser.newTab({ privateTab: false }) // Keep false

    console.log("Navigate to http://www.whatsmyip.org to check new ip and user agent")
    await newTab.goTo('http://www.whatsmyip.org')

    console.log("Wait 5 seconds")
    await newTab.wait(5000)

    console.log("Navigate to https://news.ycombinator.com to scrape data")
    await newTab.goTo('https://news.ycombinator.com')

    console.log('Evaluating table element')
    const htmlTag = await newTab.evaluate(function(selector) {
      const selectorHtml = document.querySelector(selector)
      return selectorHtml.innerHTML
    }, 'table.itemlist');

    console.log('Setting table_value variable')
    const table_value = await htmlTag.result.value

    console.log('Scraping data')
    await x(table_value, 'tr', [{
      Title: 'a.storylink',
      Url: 'a.storylink@href'
    }])(async (error, data) => {
      if(error){
        throw error
      } else {
        console.log(data)
        let json_object = await JSON.stringify(data);

        console.log('Writing scraped data to results.json and results.csv')
        await fs.writeFileSync('results.json', json_object, 'utf8');

        await jsonexport(data,(err, csv) => {
          if(err) return console.log(err);
          fs.writeFileSync('results.csv', csv, 'ascii');
        });
      }
    })

    console.log("Close browser")
    await newTab.close(true)
    await browser.close(true)

  } catch (error) {
    console.log('Error: ', error)
  }
}
console.log("Starting main function")
main()
