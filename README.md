# Example script to scrape somewhat anonymously with tor and ip switching

## Dependencies

- Tor
- Node.js
- Chrome

## Local Installation via Terminal Command Line

```
git clone git@github.com:joecal/tor_scraper_example.git
cd tor_scraper_example
npm install
```

After installing, open Browser.js in node_modules/simple-headless-chrome/build/Browser.js and put
this flag: '--proxy-server=socks5://127.0.0.1:9050' in the flag array on line 44 like so:

```javascript
  flags: ['--enable-logging','--proxy-server=socks5://127.0.0.1:9050'],
```

Now run this Command

```
node index.js
```

## Issues

- Needs user agent switching support
