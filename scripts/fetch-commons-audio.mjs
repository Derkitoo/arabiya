import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'

const USER_AGENT = 'ArabiyaMVP/0.1 (local educational prototype)'
const DELAY_MS = Number(process.env.AUDIO_FETCH_DELAY_MS ?? 3500)
const REQUEST_TIMEOUT_MS = Number(process.env.AUDIO_FETCH_TIMEOUT_MS ?? 15000)
const SPEAKER = 'AlNatiq'
const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=')
    return [key, value]
  }),
)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function readTargets() {
  const lettersText = fs.readFileSync('src/content/letters.ts', 'utf8')
  const wordsText = fs.readFileSync('src/content/words.ts', 'utf8')
  const letters = [...lettersText.matchAll(/id: '([^']+)'[\s\S]*?char: '([^']+)'/g)].map(
    (match) => ({ kind: 'letter', id: match[1], text: match[2] }),
  )
  const words = [...wordsText.matchAll(/\{ id: '([^']+)', arabic: '([^']+)'/g)].map((match) => ({
    kind: 'word',
    id: match[1],
    text: match[2],
  }))
  return [...letters, ...words]
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          if (res.statusCode === 429) {
            reject(new Error('429 too many requests'))
            return
          }
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`${res.statusCode} ${data.slice(0, 120)}`))
            return
          }
          resolve(JSON.parse(data))
        })
      })
      .setTimeout(REQUEST_TIMEOUT_MS, function onTimeout() {
        this.destroy(new Error(`request timeout after ${REQUEST_TIMEOUT_MS}ms`))
      })
      .on('error', reject)
  })
}

function getText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': USER_AGENT } }, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`${res.statusCode} ${data.slice(0, 120)}`))
            return
          }
          resolve(data)
        })
      })
      .setTimeout(REQUEST_TIMEOUT_MS, function onTimeout() {
        this.destroy(new Error(`request timeout after ${REQUEST_TIMEOUT_MS}ms`))
      })
      .on('error', reject)
  })
}

function commonsPageUrl(text) {
  const title = `File:LL-Q13955_(ara)-${SPEAKER}-${text}.wav`
  return `https://commons.wikimedia.org/wiki/${encodeURI(title)}`
}

async function pageFileInfo(text) {
  const pageUrl = commonsPageUrl(text)
  const html = await getText(pageUrl)
  if (!html.includes('Creative Commons CC0') && !html.includes('CC-Zero')) return null
  const mp3Match = html.match(/href="([^"]*upload\.wikimedia\.org\/wikipedia\/commons\/transcoded[^"]+?\.mp3[^"]*)"/)
  const wavMatch = html.match(/href="([^"]*upload\.wikimedia\.org[^"]+?\.wav[^"]*)"/)
  const url = mp3Match ? mp3Match[1].replaceAll('&amp;', '&') : (wavMatch ? wavMatch[1].replaceAll('&amp;', '&') : null)
  if (!url) return null
  const ext = url.includes('.mp3') ? 'mp3' : 'wav'
  return {
    title: `File:LL-Q13955 (ara)-${SPEAKER}-${text}.wav`,
    pageUrl,
    url,
    ext,
    license: 'CC0',
  }
}

async function searchTitle(text) {
  const query = `LL-Q13955 ara ${SPEAKER} ${text}`
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=20&srsearch=' +
    encodeURIComponent(query)
  const json = await getJson(url)
  return json.query.search.find(
    (item) => item.title.includes(SPEAKER) && item.title.endsWith(`-${text}.wav`),
  )
}

async function pageInfo(pageid) {
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&pageids=' +
    pageid
  const json = await getJson(url)
  const page = Object.values(json.query.pages)[0]
  return page?.imageinfo?.[0] ?? null
}

async function download(url, dest) {
  await fs.promises.mkdir(path.dirname(dest), { recursive: true })
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, { headers: { 'User-Agent': USER_AGENT, Referer: 'https://commons.wikimedia.org/' } }, (res) => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          file.close()
          fs.rm(dest, { force: true }, () => reject(new Error(`download ${res.statusCode}`)))
          return
        }
        res.pipe(file)
        file.on('finish', () => file.close(resolve))
      })
      .setTimeout(REQUEST_TIMEOUT_MS, function onTimeout() {
        this.destroy(new Error(`download timeout after ${REQUEST_TIMEOUT_MS}ms`))
      })
      .on('error', (error) => {
        file.close()
        fs.rm(dest, { force: true }, () => reject(error))
      })
  })
}

async function main() {
  const start = Number(args.get('start') ?? 0)
  const limit = args.has('limit') ? Number(args.get('limit')) : Infinity
  const targets = readTargets().slice(start, Number.isFinite(limit) ? start + limit : undefined)
  const downloaded = []
  const missed = []

  for (const target of targets) {
    console.log(`try ${target.kind} ${target.id} ${target.text}`)
    const mp3Dest = `public/audio/${target.kind}s/${target.id}.mp3`
    const wavDest = `public/audio/${target.kind}s/${target.id}.wav`
    if (fs.existsSync(mp3Dest)) {
      downloaded.push({ ...target, file: mp3Dest, source: 'local', license: 'CC0' })
      continue
    }
    if (fs.existsSync(wavDest)) {
      downloaded.push({ ...target, file: wavDest, source: 'local', license: 'CC0' })
      continue
    }

    try {
      await sleep(DELAY_MS)
      const fromPage = await pageFileInfo(target.text).catch(() => null)
      if (fromPage) {
        const dest = `public/audio/${target.kind}s/${target.id}.${fromPage.ext}`
        await sleep(DELAY_MS)
        await download(fromPage.url, dest)
        downloaded.push({
          ...target,
          file: dest,
          source: fromPage.pageUrl,
          license: fromPage.license,
          speaker: SPEAKER,
        })
        console.log(`ok ${target.kind} ${target.id} (${fromPage.ext})`)
        continue
      }

      await sleep(DELAY_MS)
      const result = await searchTitle(target.text)
      if (!result) {
        missed.push(target)
        continue
      }

      await sleep(DELAY_MS)
      const info = await pageInfo(result.pageid)
      const license = info?.extmetadata?.LicenseShortName?.value ?? ''
      if (!info?.url || !license.includes('CC0')) {
        missed.push({ ...target, found: result.title, license })
        continue
      }

      await sleep(DELAY_MS)
      await download(info.url, wavDest)
      downloaded.push({
        ...target,
        file: wavDest,
        source: `https://commons.wikimedia.org/wiki/${encodeURIComponent(result.title)}`,
        license: 'CC0',
        speaker: SPEAKER,
      })
      console.log(`ok ${target.kind} ${target.id} (wav)`)
    } catch (error) {
      missed.push({ ...target, error: error.message })
      console.warn(`miss ${target.kind} ${target.id}: ${error.message}`)
      if (error.message.includes('429')) await sleep(DELAY_MS * 8)
    }
  }

  await fs.promises.writeFile(
    'public/audio/manifest.json',
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: 'Wikimedia Commons / Lingua Libre',
        speaker: SPEAKER,
        downloaded,
        missed,
      },
      null,
      2,
    ) + '\n',
  )

  console.log(`downloaded=${downloaded.length} missed=${missed.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
