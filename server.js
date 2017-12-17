const dev = process.env.NODE_ENV !== 'production'

const { createServer } = require('http')
const { parse } = require('url')
const indexer = require('elastic-image-indexer')
const next = require('next')
const mobxReact = require('mobx-react')
const app = next({ dev })
const handle = app.getRequestHandler()

mobxReact.useStaticRendering(true)

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    if(req.method == 'GET'){
      handle(req, res, parsedUrl)  
    }else if(req.method == 'POST'){
        indexer.start()
       res.setHeader('Content-Type', 'text/html');
       res.writeHead(200);
       res.end("success");
    }
    
  }).listen(3000, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})