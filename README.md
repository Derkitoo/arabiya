# Arabiya

Application web d'apprentissage de l'arabe. Refonte complète : une action à la fois, mobile d'abord.

## Principe

Pas de menus, pas d'onglets, pas de choix à faire. L'app propose une seule chose : la session
du jour. L'utilisateur avance écran par écran, un exercice à la fois, avec une correction
immédiate.

C'est le principe qui gouverne toutes les décisions d'UI : **si un écran offre plus d'une
action possible, c'est qu'il est mal conçu.**

## Lancer

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5190
```

```bash
npm run lint    # ESLint
npm test        # Vitest — 48 tests sur la logique pure
npm run build   # typecheck + build production dans dist/
```

Note Windows : le script de build utilise `vite build -- .` pour contourner un problème de
chemin avec Vite sur Windows.

## Parcours

1. **Onboarding** — accueil, niveau de départ, rythme quotidien. Aucun compte, aucun email.
2. **Accueil** — une carte « aujourd'hui », l'avancement dans l'alphabet, un seul bouton.
3. **Session** — écrans enchaînés. Barre de progression, correction en panneau bas.
4. **Bilan** — score, série de jours, retour à l'accueil.

## On montre avant de demander

Règle absolue : **aucune question n'est posée sur une lettre que l'utilisateur n'a pas déjà
vue.** Une lettre sans carte est d'abord présentée sur un écran `teach` — le signe, son nom,
son son, ses trois formes attachées, l'audio — avec pour seule action « J'ai compris ».

Cet écran ne se corrige pas : il n'entre ni dans le score ni dans la répétition espacée
(`isScored` dans [types.ts](src/content/types.ts)).

## Test de placement

Le niveau n'est pas déclaré, il est **mesuré**. Deux chemins à l'inscription : partir de zéro,
ou passer le test.

[content/placement.ts](src/content/placement.ts) interroge **une lettre par famille de
tracé** — dix questions couvrent l'alphabet. À l'intérieur d'une famille, les lettres ne
diffèrent que par les points : reconnaître ب vaut pour ت ث ن ي.

Aucune correction n'est affichée pendant le test, volontairement : corriger au fil des
questions apprendrait les lettres suivantes et fausserait la mesure.

Une carte amorcée par le test est **à vérifier**, jamais **acquise** : elle est due le jour
même et ne compte comme maîtrisée qu'après une vraie réussite en séance.

Le test est repassable depuis les réglages. Il n'ajoute que des cartes manquantes — une
progression déjà en cours n'est jamais écrasée, et la série comme l'historique sont conservés.

## Réglages

Accessibles par l'engrenage de l'accueil : rythme quotidien, repassage du test, effacement
total. L'effacement demande une confirmation explicite, puisque rien n'est sauvegardé
ailleurs.

## Types d'exercices

| Type | Écran | Noté |
|---|---|---|
| `teach` | Présentation d'une lettre | non |
| `word-intro` | Présentation d'un mot | non |
| `recognize` | Un signe arabe, 4 lectures en latin | oui |
| `translate` | Un mot arabe, 4 sens au choix | oui |
| `listen` | Écoute, 4 graphies au choix (lettres comme mots) | oui |
| `write` | Une translittération, saisie en arabe | oui |

Tous définis dans [types.ts](src/content/types.ts), rendus dans
[Session.tsx](src/screens/Session.tsx), assemblés dans [session.ts](src/content/session.ts).

## L'exercice se durcit avec la carte

Le type d'exercice n'est pas fixé par le contenu, il est **déduit de l'état de la carte**.

| Réussites | Lettre | Mot |
|---|---|---|
| aucune carte | présentation | présentation |
| 0–1 | reconnaître le signe | reconnaître le sens |
| 2–3 | retrouver à l'oreille | retrouver à l'oreille |
| 4+ | — | écrire |

Deux verrous distincts sur les mots, et c'est ce qui rend le vocabulaire accessible tôt :

- **reconnaître le sens** ne demande que d'avoir *rencontré* les lettres
- **écrire** exige de les avoir *maîtrisées* — sinon l'exercice reste à l'écoute

Un mot qui atteint 4 réussites mais dont les lettres ne sont pas maîtrisées ne bascule donc
pas en écriture : on ne demande pas de tracer des signes qu'on ne sait pas encore produire.

Ajouter un type d'exercice se fait à deux endroits seulement : le type dans
[content/types.ts](src/content/types.ts) et son rendu dans [screens/Session.tsx](src/screens/Session.tsx).

## Structure

```text
src/
  styles/tokens.css   # toutes les couleurs, espacements, typos — source unique
  styles/base.css     # reset, gabarit .app-frame, classe .ar pour l'arabe
  ui/                 # Screen, Button, ProgressBar, Feedback, SpeakButton
  screens/            # Onboarding, Home, Session, Summary
  content/            # types d'exercices + contenu
  lib/                # storage (localStorage v1), speech, shuffle
```

Règle : aucune valeur brute (`#hex`, `px`) hors de `tokens.css`.

## Persistance

Une seule clé `arabiya:v1`, un seul schéma versionné, lu et écrit uniquement via
[lib/storage.ts](src/lib/storage.ts). Un changement de schéma repart d'un profil vierge plutôt
que de tenter une migration hasardeuse.

## Contenu

Les **28 lettres** sont dans [content/letters.ts](src/content/letters.ts) avec, pour chacune :
son nom, son son en français, ses trois formes attachées, et sa **famille visuelle**.

La famille est ce qui rend les exercices utiles : les leurres d'un QCM sont tirés en priorité
parmi les lettres au même squelette (ب / ت / ث / ن / ي), pas au hasard. C'est exactement là que
le débutant se trompe.

Six lettres ne se lient jamais à la suivante (`connects: false`) — alif, dāl, dhāl, rā, zāy,
wāw. La correction le signale.

## Répétition espacée

[lib/srs.ts](src/lib/srs.ts) — variante simplifiée de SM-2, à granularité d'un jour. Chaque
item porte une carte : réussites consécutives, facteur de facilité (1.3 à 2.8), intervalle,
échéance, nombre d'échecs.

- Réussite : les paliers 1 et 3 jours sont fixes, ensuite `intervalle × facilité`, plafonné
  à un an.
- Échec : la carte revient **dès la session suivante**, sa facilité baisse de 0.2 durablement.
- Une lettre est dite **maîtrisée** après deux réussites consécutives, pas une.

[content/session.ts](src/content/session.ts) assemble la séance : cartes échues d'abord (les
plus en retard et les plus ratées en tête), puis un quota de nouveautés (la moitié de la
séance au maximum), puis de la révision en avance s'il reste de la place.

## Ordre d'introduction

Les lettres sont introduites **par fréquence d'usage**, pas dans l'ordre de l'alphabet
(`teachingOrder` dans [content/letters.ts](src/content/letters.ts)) : ا ل ي م و ن ر ت ب ه …

L'ordre alphabétique plaçait yā en 28ᵉ position, donc un mot aussi banal que بيت attendait la
toute fin. Effet secondaire utile : les lettres d'une même famille (ب ت ث ن ي) se retrouvent
espacées, donc chacune est acquise avant qu'on rencontre sa voisine à points.

Les mots ne font pas la queue derrière les 28 lettres : dès qu'un mot est déblocable, il prend
une part réservée du quota de nouveautés (`WORDS_PER_SESSION`). Sans cette réserve, le premier
mot n'arrivait qu'au 11ᵉ jour ; avec, il arrive au 3ᵉ.

## Plafond d'écriture

Réviser un mot veut toujours dire l'écrire, et écrire est la modalité la plus exigeante : il
faut produire les signes de mémoire, pas les reconnaître parmi quatre. À mesure que le
vocabulaire grossit, les révisions dues rempliraient la séance entière — jusqu'à 7 saisies sur
11 en simulation.

L'écriture est donc plafonnée à `WRITE_SHARE` (40 %) de la séance. Le surplus est reporté au
lendemain : une carte revue avec un jour de retard ne perd rien, alors qu'une séance qu'on
redoute est une séance qu'on saute. Mesuré sur 60 jours : 4 saisies par séance au maximum,
aucune séance déséquilibrée.

L'exercice se durcit avec la carte : on reconnaît d'abord un signe qu'on voit, puis dès la
2ᵉ réussite on doit le retrouver **à l'oreille seule**.

Toutes les dates passent par [lib/date.ts](src/lib/date.ts), en heure locale. `toISOString()`
renvoie la date UTC, ce qui décalait les échéances d'un jour à l'est de Greenwich.

## État actuel

- ✅ Parcours complet fonctionnel, testé de bout en bout
- ✅ Design system, thème clair et sombre, zones tactiles ≥ 44 px
- ✅ 28 lettres, progression alphabet visible sur l'accueil
- ✅ Répétition espacée, simulée sur 30 jours : 27 lettres sur 28 maîtrisées
- ✅ Test de placement en 10 questions, repassable, sans écraser la progression
- ✅ Jamais de question sur une lettre jamais montrée
- ✅ 22 mots, chacun verrouillé tant que ses lettres ne sont pas maîtrisées
- ✅ Réglages : rythme, niveau, effacement
- ✅ Migration du schéma 1 vers le 2 sans perte de progression
- ✅ 48 tests sur la logique pure : répétition espacée, dates, séance, contenu, placement
- ✅ Trois modalités sur les mots — sens, écoute, écriture — servies selon la maîtrise
- ⚠️ L'audio dépend des voix du système. Un exercice d'écoute sur un appareil sans voix arabe
  reste jouable mais muet : il faudra des enregistrements réels (voir *Audio* ci-dessous)
- ❌ Vocabulaire limité à 22 mots, sans thèmes : l'app est à court de contenu vers le 30ᵉ jour
- ❌ Aucun travail de prononciation : les sons de gorge (ح خ ع غ) ne sont jamais produits
- ❌ Pas de grammaire, pas de phrases : l'app s'arrête au mot isolé

L'ancienne version (monolithe de 2 635 lignes) a été supprimée ; elle reste consultable dans
le premier commit du dépôt.

## Limites assumées

Pas de backend, pas de compte utilisateur, sauvegarde locale au navigateur. L'audio dépend des
voix arabes installées sur l'appareil ; l'app détecte leur absence et le signale sans casser
l'exercice.
