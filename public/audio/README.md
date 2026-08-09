# Audio stable

L'app cherche les fichiers dans cet ordre :

```text
public/audio/letters/<id>.mp3
public/audio/letters/<id>.webm
public/audio/letters/<id>.ogg
public/audio/letters/<id>.wav

public/audio/words/<id>.mp3
public/audio/words/<id>.webm
public/audio/words/<id>.ogg
public/audio/words/<id>.wav
```

Si aucun fichier n'existe, elle utilise la voix arabe du navigateur en secours.

Les identifiants viennent de :

- `src/content/letters.ts`
- `src/content/words.ts`

Recommandation de licence : utiliser des enregistrements propres au projet ou des fichiers
Wikimedia Commons / Lingua Libre en CC0, avec attribution documentee si une autre licence l'exige.

Pour tenter une recuperation depuis Wikimedia Commons :

```bash
npm run audio:fetch
```

Le script est volontairement lent pour eviter les blocages `429 too many requests`.
Il commence par lire la page Commons comme Chromium et suit le lien `Original file`, puis utilise
l'API Commons seulement en secours.

Pour tester un petit lot :

```bash
npm run audio:fetch -- --limit=5
```

Pour reprendre plus loin :

```bash
npm run audio:fetch -- --start=30 --limit=10
```
