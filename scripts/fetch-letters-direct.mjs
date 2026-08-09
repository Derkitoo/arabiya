import fs from 'node:fs'
import https from 'node:https'

const USER_AGENT = 'ArabiyaMVP/0.1 (local educational prototype)'
const DELAY_MS = 2500

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readLetters() {
  const lettersText = fs.readFileSync('src/content/letters.ts', 'utf8')
  return [...lettersText.matchAll(/id: '([^']+)'[\s\S]*?char: '([^']+)'/g)].map(
    (match) => ({ id: match[1], char: match[2] }),
  )
}

function getText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          if (res.statusCode === 429) {
            reject(new Error('429'))
          } else {
            resolve(data)
          }
        })
      })
      .on('error', reject)
  })
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          file.close()
          fs.rmSync(dest, { force: true })
          reject(new Error(`Status ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on('finish', () => file.close(resolve))
      })
      .on('error', (err) => {
        file.close()
        fs.rmSync(dest, { force: true })
        reject(err)
      })
  })
}

async function main() {
  const letters = readLetters()
  fs.mkdirSync('public/audio/letters', { recursive: true })
  console.log(`Starting direct fetch for ${letters.length} letter audios...`)

  let success = 0
  for (const letter of letters) {
    const dest = `public/audio/letters/${letter.id}.mp3`
    if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
      console.log(`✓ ${letter.id} (${letter.char}): already exists`)
      success++
      continue
    }

    const pageUrl = `https://commons.wikimedia.org/wiki/File:LL-Q13955_(ara)-AlNatiq-${encodeURIComponent(letter.char)}.wav`
    try {
      await sleep(DELAY_MS)
      const html = await getText(pageUrl)
      const matches = html.match(/https:\/\/[^"'\s]+\.mp3[^\s"']*/g)
      if (matches && matches.length > 0) {
        const mp3Url = matches[0].replaceAll('&amp;', '&')
        await sleep(1000)
        await download(mp3Url, dest)
        const size = fs.statSync(dest).size
        console.log(`✓ ${letter.id} (${letter.char}): downloaded (${size} bytes)`)
        success++
      } else {
        console.log(`✗ ${letter.id} (${letter.char}): page found but no MP3 transcode`)
      }
    } catch (err) {
      console.warn(`! ${letter.id} (${letter.char}): ${err.message}`)
      if (err.message === '429') {
        console.log('Rate limited, sleeping 12s...')
        await sleep(12000)
      }
    }
  }

  console.log(`Finished! Total local letter MP3 files: ${success}/${letters.length}`)
}

main().catch(console.error)
