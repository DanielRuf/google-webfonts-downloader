const https = require('https')
const readline = require('readline')
const fs = require('fs')
const pkg = require('./package.json')
const API_ENDPOINT = 'https://google-webfonts-helper.herokuapp.com/api/fonts'

console.log(pkg.name + " " + pkg.version)

getData()

function getData(){
  https.get(API_ENDPOINT, (resp) => {
    let data = ''

    resp.on('data', (chunk) => {
      data += chunk
    })

    resp.on('end', () => {
      const fonts = JSON.parse(data)
      if(typeof fonts === 'object' && fonts.length > 0){
        processFonts(fonts)
      }
    })

  }).on('error', (err) => {
    console.log('Error: ' + err.message)
  })
}

async function processFonts(fonts){
  const fontfacekits_count = fonts.length
  for(i = 0; i < fontfacekits_count; i++) {
    const fontfacekit = fonts[i]
    const fontfacekits_count_current = i + 1
    const subsets_count = fontfacekit.subsets.length

    for(j = 0; j < subsets_count; j++) {
      const subset_current = j + 1
      const subset_name = fontfacekit.subsets[j]
      await downloadFontfacekit(fontfacekit.id, fontfacekits_count_current, fontfacekits_count, subset_current, subsets_count, subset_name)
    }
  }
  console.log('')
  console.log('Done.')
}

function downloadFontfacekit(fontname, fontfacekits_count_current, fontfacekits_count, subset_current, subsets_count, subset_name){
  return new Promise((resolve, reject) => {
    https.get(API_ENDPOINT + '/' + fontname + '?download=zip&subsets=' + subset_name, (resp) => {

      let data = ''
      let cur = 0

      const len = parseInt(resp.headers['content-length'], 10)
      const fontfacekit_filename = fontname+'-' + subset_name + '-fontfacekit.zip'
      const file = fs.createWriteStream('./' + fontfacekit_filename)

      resp.on('data', (chunk) => {
        cur += chunk.length
        file.write(chunk)
        readline.clearLine(process.stdout, 0)
        readline.cursorTo(process.stdout, 0)
        process.stdout.write('Downloading fontfacekit ' + fontfacekits_count_current + ' of ' + fontfacekits_count + ' (subset ' + subset_current + ' of ' + subsets_count + ')')
      })

      resp.on('end', () => {
        resolve()
      })

  }).on('error', (err) => {
      console.log('')
      console.log('Error: ' + err.message)
      reject(err)
    })
  })
}
