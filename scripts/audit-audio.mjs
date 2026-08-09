import fs from 'node:fs'

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
  return { letters, words }
}

function findLocalAudio(kind, id) {
  const extensions = ['mp3', 'webm', 'ogg', 'wav']
  for (const ext of extensions) {
    const relPath = `public/audio/${kind}s/${id}.${ext}`
    if (fs.existsSync(relPath)) {
      const stats = fs.statSync(relPath)
      return { found: true, ext, path: relPath, sizeBytes: stats.size }
    }
  }
  return { found: false }
}

function runAudit() {
  const { letters, words } = readTargets()
  
  const letterResults = letters.map((item) => ({
    ...item,
    audio: findLocalAudio('letter', item.id),
  }))

  const wordResults = words.map((item) => ({
    ...item,
    audio: findLocalAudio('word', item.id),
  }))

  const localLettersCount = letterResults.filter((l) => l.audio.found).length
  const localWordsCount = wordResults.filter((w) => w.audio.found).length

  console.log('\n=== AUDIT DE LA COUVERTURE AUDIO ARABIYA ===\n')
  console.log(`Letters (28 au total) : ${localLettersCount} audios locaux HD (${Math.round((localLettersCount / letters.length) * 100)}%), ${letters.length - localLettersCount} synthèse vocale fallback`)
  console.log(`Words   (78 au total) : ${localWordsCount} audios locaux HD (${Math.round((localWordsCount / words.length) * 100)}%), ${words.length - localWordsCount} synthèse vocale fallback\n`)

  console.log('Fichiers audios locaux HD détectés :')
  for (const item of [...letterResults, ...wordResults]) {
    if (item.audio.found) {
      console.log(`  - [${item.kind.toUpperCase()}] ${item.id} (${item.text}) -> ${item.audio.path} (${item.audio.sizeBytes} octets)`)
    }
  }

  // Update manifest.json with audit summary
  const manifestPath = 'public/audio/manifest.json'
  let manifestData = {}
  if (fs.existsSync(manifestPath)) {
    try {
      manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    } catch {
      manifestData = {}
    }
  }

  manifestData.lastAuditAt = new Date().toISOString()
  manifestData.summary = {
    totalLetters: letters.length,
    localLetters: localLettersCount,
    fallbackLetters: letters.length - localLettersCount,
    totalWords: words.length,
    localWords: localWordsCount,
    fallbackWords: words.length - localWordsCount,
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2) + '\n')
  console.log('\nAudit enregistré dans public/audio/manifest.json !\n')
}

runAudit()
