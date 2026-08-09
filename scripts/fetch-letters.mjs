import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'

const USER_AGENT = 'ArabiyaMVP/0.1 (local educational prototype)'
const DELAY_MS = 2500

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readLetters() {
  const lettersText = fs.readFileSync('src/content/letters.ts', 'utf8')
  return [...lettersText.matchAll(/id: '([^']+)'[\s\S]*?char: '([^']+)'[\s\S]*?name: '([^']+)'/g)].map(
    (match) => ({ id: match[1], char: match[2], name: match[3] }),
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

async function fetchLetterAudio(letter) {
  const pageUrl = `https://commons.wikimedia.org/wiki/File:LL-Q13955_(ara)-AlNatiq-${encodeURIComponent(letter.char)}.wav`
  try {
    const html = await getText(pageUrl)
    const matches = html.match(/https:\/\/[^"'\s]+\.mp3[^\s"']*/g)
    if (matches && matches.length > 0) {
      return matches[0].replaceAll('&amp;', '&')
    }
  } catch (e) {
    if (e.message === '429') throw e
  }

  // Try search query if direct page didn't match AlNatiq
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=5&srsearch=${encodeURIComponent(`LL-Q13955 ara ${letter.char}`)}`
  const searchJson = JSON.parse(await getText(searchUrl))
  const results = searchJson.query?.search ?? []
  if (results.length > 0) {
    const title = results[0].title
    const itemPageUrl = `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`
    await sleep(1500)
    const html = await getText(itemPageUrl)
    const matches = html.match(/https:\/\/[^"'\s]+\.mp3[^\s"']*/g)
    if (matches && matches.length > 0) {
      return matches[0].replaceAll('&amp;', '&')
    }
  }
  return null
}

async function main() {
  const letters = readLetters()
  fs.mkdirSync('public/audio/letters', { recursive: true })
  console.log(`Starting audio fetch for ${letters.length} letters...`)

  let successCount = 0
  for (const letter of letters) {
    const dest = `public/audio/letters/${letter.id}.mp3`
    if (fs.existsSync(dest)) {
      console.log(`- ${letter.id} (${letter.char}): already exists`)
      successCount++
      continue
    }

    try {
      await sleep(DELAY_MS)
      const mp3Url = await fetchLetterAudio(letter)
      if (mp3Url) {
        await sleep(1000)
        await download(mp3Url, dest)
        const size = fs.statSync(dest).size
        console.log(`✓ ${letter.id} (${letter.char}): downloaded (${size} bytes)`)
        successCount++
      } else {
        console.log(`✗ ${letter.id} (${letter.char}): no audio found on Commons`)
      }
    } catch (err) {
      console.warn(`! ${letter.id} (${letter.char}): error - ${err.message}`)
      if (err.message === '429') {
        console.log('Rate limited (429), waiting 10 seconds...')
        await sleep(10000)
      }
    }
  }

  console.log(`Done! ${successCount}/${letters.length} letter audio files available locally.`)
}

main().catch(console.error)
