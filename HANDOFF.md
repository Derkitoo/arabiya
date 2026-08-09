# Handoff - Arabiya

Dernière mise à jour : 2026-08-10

Ce fichier sert de passation entre les IA qui travaillent sur ce dossier. Lire ceci avant toute
modification pour éviter d'écraser le travail d'un autre agent.

## État actuel

Application React / TypeScript / Vite pour apprendre l'arabe, dossier :

```text
C:\Users\K2R\Documents\Codex\arabic-learning-mvp
```

Serveur local utilisé par le client :

```bash
npm run dev -- --host 127.0.0.1 --port 5190
```

URL de test :

```text
http://127.0.0.1:5190/
```

## Important pour les autres IA

- Ne pas lancer de reset Git destructif.
- Ne pas supprimer les changements non commit sans accord utilisateur.
- Vérifier `git status --short` avant de modifier.
- Si une autre IA a modifié un fichier entre deux actions, relire le fichier avant patch.
- Le projet contient déjà du contenu arabe en UTF-8. PowerShell peut afficher du mojibake, donc ne
  pas "corriger" les caractères arabes uniquement à partir de l'affichage terminal.
- Les sons prioritaires utilisent les fichiers locaux (désormais `.mp3`), et retombent sur la synthèse vocale Web Speech API (`src/lib/speech.ts`).

## Changements récents non commit (2026-08-10)

1. **Optimisation Médias MP3 (réduction de ~97% du poids)** :
   - Fichiers audios téléchargés de Wikimedia transcodes directement en `.mp3` (2 Ko vs 80 Ko auparavant).
   - Les 6 fichiers locaux de mots sont convertis en `.mp3` : `bint`, `shay`, `qahwa`, `waraqa`, `hatif`, `matar_airport`.
2. **Audit Audio Automatisé** :
   - Script `scripts/audit-audio.mjs` ajouté.
   - Commande `npm run audio:audit` pour vérifier instantanément la couverture des 28 lettres et 78 mots.
3. **Indicateurs d'état Visuels dans l'UI** :
   - `src/screens/Sounds.tsx` : Badges `HD (MP3)` vs `Synthèse` sur chaque ligne de la bibliothèque des sons.
   - Barre de couverture globale affichant la métrique (ex: `6 / 78 mots avec audio HD local`).
   - `src/lib/speech.ts` : Ajout de `checkAudioSource` et retour du statut via `onSourceResolved`.
4. **Tests de Cohérence** :
   - Ajout de `src/content/audio.test.ts` (5 tests Vitest couvrant la couche audio, la génération de chemins et les callbacks).
   - Suite totale passée à **58 tests validés**.

Validation faite après ces changements :

```bash
npm run build        # TypeScript + Vite OK
npm run lint         # ESLint OK
npm test             # Vitest 58/58 tests OK
npm run audio:audit  # Audit audio OK
```

## Architecture actuelle

Fichiers principaux :

```text
src/App.tsx                 # routeur/state shell local
src/screens/Home.tsx        # accueil
src/screens/Session.tsx     # lecteur de session
src/screens/Sounds.tsx      # bibliothèque audio (avec badges & métriques HD/Synthèse)
src/screens/Settings.tsx    # réglages
src/content/letters.ts      # 28 lettres + formes + familles
src/content/words.ts        # vocabulaire thématique
src/content/audio.test.ts   # tests de la couche et infrastructure audio
src/content/session.ts      # construction de la session du jour
src/content/types.ts        # types d'exercices
src/lib/speech.ts           # fichiers audio locaux MP3/WebM/WAV + fallback synthèse vocale
src/lib/srs.ts              # répétition espacée
src/lib/storage.ts          # localStorage profile
src/ui/index.tsx            # composants UI partagés
scripts/audit-audio.mjs     # audit de la couverture des fichiers locaux
scripts/fetch-commons-audio.mjs # fetcher Wikimedia (priorité MP3 CC0)
```

## Prochaine suite recommandée

1. Continuer la récupération des audios pour les mots manquants via `npm run audio:fetch` ou enregistrements propres.
2. Ajouter la gestion d'un enregistreur audio interne ou test de prononciation microphone si souhaité par le produit.
3. Ajouter des modules de phrases simples ou grammaire de base au-delà des mots isolés.
