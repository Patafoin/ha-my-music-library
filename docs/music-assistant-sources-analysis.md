# Music Assistant — Analyse des sources et suggestions UX

> Basé sur Music Assistant v2.8.x (mai 2026)

---

## 1. Tableau par catégorie de source

### Streaming grand public

| Source | Pistes | Albums | Artistes | Playlists | Radios | Podcasts | Audiobooks | Favoris | Radio Mode | Lossless | Paroles |
|--------|:------:|:------:|:--------:|:---------:|:------:|:--------:|:----------:|:-------:|:----------:|:--------:|:-------:|
| **Spotify** | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ | — | — |
| **Deezer** | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ FLAC | ✓ |
| **Tidal** | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ 24bit | ✓ |
| **Apple Music** | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | — AAC | — |
| **YouTube Music** | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | ✓ | — | — |
| **Qobuz** | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | **—** | ✓ 24bit | — |
| **SoundCloud** | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | **—** | — | — |
| **Yandex Music** | ✓ | ✓ | ✓ | ✓ | — | — | — | ✓ | ✓ | ✓ FLAC | ✓ |

> **Radio Mode** = "Don't Stop The Music" (DSTM) — enchaîne automatiquement des pistes similaires en fin de queue.

### Serveurs locaux / auto-hébergés

| Source | Pistes | Albums | Artistes | Playlists | Podcasts | Audiobooks | Radio Mode | Qualité max |
|--------|:------:|:------:|:--------:|:---------:|:--------:|:----------:|:----------:|:-----------:|
| **Filesystem** (local/SMB/NFS) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | Illimité (FLAC 24bit) |
| **Jellyfin** | ✓ | ✓ | ✓ | ✓ | — | — | — | FLAC 24bit |
| **Plex** | ✓ | ✓ | ✓ | ✓ | — | — | — | FLAC 24bit |
| **Emby** | ✓ | ✓ | ✓ | ✓ | — | — | — | FLAC 24bit |
| **Subsonic** (OpenSubsonic) | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | FLAC 24bit |

### Radios

| Source | Stations | Browse par pays | Browse par genre | Login | Gratuit | Qualité |
|--------|:--------:|:---------------:|:----------------:|:-----:|:-------:|:-------:|
| **RadioBrowser** | ✓ | ✓ | ✓ | — | ✓ | Variable |
| **TuneIn** | ✓ | ✓ | ✓ | Optionnel | ✓ | Variable |
| **Radio Paradise** | ✓ (4 canaux) | — | — | — | ✓ | FLAC |
| **SomaFM** | ✓ (30+ canaux) | — | Thématiques | — | ✓ | AAC |
| **ORF Radiothek** | ✓ + Podcasts | — | — | — | ✓ | HLS |

### Podcasts & Livres audio

| Source | Podcasts | Audiobooks | Progression sync | Chapitres | Gratuit |
|--------|:--------:|:----------:|:----------------:|:---------:|:-------:|
| **Podcast Index** | ✓ | — | — | — | ✓ |
| **gPodder** | ✓ | — | ✓ bidirectionnel | — | ✓ |
| **Audiobookshelf** | ✓ | ✓ | ✓ bidirectionnel | ✓ | Auto-hébergé |
| **Audible** | — | ✓ | — | ✓ | Payant |
| **BBC Sounds** | ✓ | — | — | — | UK |
| **Internet Archive** | ✓ | ✓ | — | — | ✓ |

### Niche & archivage

| Source | Contenu | Particularités |
|--------|---------|----------------|
| **Bandcamp** | Pistes, Albums, Artistes | Albums achetés importables, 128 kbps, communautaire |
| **Phish.in** | 1 800+ concerts Phish | Albums = shows, 50 000+ enregistrements, MP3 |
| **Nugs.net** | Concerts live multi-artistes | FLAC 24bit, payant |
| **Internet Archive** | Concerts, audiobooks, podcasts | FLAC 16bit, gratuit, limite 200 résultats |
| **Niconico** | Pistes, Playlists, Artistes | Recommandations, Radio Mode, japonais |

---

## 2. Spécificités importantes

### Radio Mode (DSTM — Don't Stop The Music)

- Quand la queue se vide, MA cherche des pistes similaires à ce qui vient d'être joué
- **Supporté :** Spotify, Deezer, Tidal, Apple Music, YouTube Music, Subsonic, Niconico, Yandex
- **Absent :** Qobuz, SoundCloud, Filesystem, Jellyfin, Plex, Emby, Bandcamp
- *Depuis un artiste* : pool multi-sources → diversité maximale
- *Depuis une piste* : algo mono-source → cohérence maximale

### Bibliothèque vs Catalogue vs Recherche

| Mode | Description |
|------|-------------|
| **Bibliothèque** | Uniquement ce que l'utilisateur a sauvegardé/mis en favori chez le provider |
| **Browse / Catalogue** | Tout le catalogue du provider, navigation arborescente |
| **Recherche** | Croise bibliothèque ET catalogue (selon le provider) |

### Playlists

- **Éditoriales du provider** (Deezer Flow, Discover Weekly Spotify…) → apparaissent dans la bibliothèque si synchronisées
- **Créées dans MA** → peuvent être exportées vers certains providers (sync bidirectionnel)
- **Smart playlists par genre/mood** → fonctionnalité MA v2.8 (genre discovery)

---

## 3. Filtres proposés

### Pour la Bibliothèque

| Filtre | Valeurs | Intérêt |
|--------|---------|---------|
| **Type de média** | Pistes / Albums / Artistes / Playlists / Radios / Podcasts / Audiobooks | Éviter de mélanger des natures fondamentalement différentes |
| **Provider** | Tous / Spotify / Deezer / Local / … | Retrouver "mes albums Qobuz lossless" ou "ma collection locale" |
| **Favoris seulement** | Oui / Non | Utile pour les gros catalogues |
| **Type d'album** | Albums / EPs / Singles / Compilations | Très utile |
| **Qualité** | Lossless / Lossy | Pour les audiophiles avec Qobuz/Tidal/local |
| **Radio Mode dispo** | Oui / Non | Filtrer les sources qui permettent DSTM |
| **Nouveautés** | Ajoutés récemment | "Recently added" — utile pour les grosses bibliothèques |

### Pour la Recherche

| Filtre | Valeurs | Intérêt |
|--------|---------|---------|
| **Type de résultat** | Tout / Pistes / Albums / Artistes / Playlists | Éviter de noyer l'utilisateur |
| **Périmètre** | Ma bibliothèque / Tout le catalogue | Chercher dans ses favoris vs découvrir |
| **Provider** | Tous / Provider spécifique | "Cherche cet album sur Qobuz" |
| **Exclure** | Radios / Podcasts / Audiobooks | Masquer les types non-musicaux de la recherche principale |

---

## 4. Suggestions de présentation

### Bibliothèque — ce qui devrait changer

**Problème actuel :** Tout est dans les mêmes onglets (Artistes / Albums / Pistes / Playlists / Radios), sans distinguer la nature du contenu ni le provider.

**Proposition de structure :**

```
┌────────────────────────────────────────────────────────┐
│  [Musique] [Radios] [Podcasts] [Livres audio]          │  ← 4 sections de niveau 1
└────────────────────────────────────────────────────────┘
  Dans "Musique" :
  ┌──────────────────────────────────────────────────────┐
  │  Artistes  Albums  Playlists  Pistes                 │  ← sous-onglets existants
  │                                                      │
  │  [Filtre provider : Tous ▾] [Favoris ☆] [Lossless]  │  ← chips de filtre
  └──────────────────────────────────────────────────────┘
```

**Règles clés :**
- **Radios** = section propre, ne pas les mélanger avec la musique
- **Podcasts & Audiobooks** = section dédiée avec progression/chapitres — masquée si aucun provider de ce type n'est configuré
- **Chip "Provider"** : quand plusieurs providers configurés, permettre de filtrer (ex : "Local uniquement", "Qobuz")
- **Badge de qualité** : petite puce `FLAC` / `24bit` sur les items lossless (le champ `provider_mappings` est déjà disponible dans l'API)
- **Indicateur Radio Mode** : icône onde radio sur les playlists/artistes compatibles DSTM

### Recherche — ce qui devrait changer

**Problème actuel :** Les résultats mélangent potentiellement radios, podcasts et pistes dans le même flux.

**Proposition de structure :**

```
┌────────────────────────────────────────────────────────┐
│  🔍 Artistes, albums, pistes…                          │
│                                                        │
│  [Tout] [Pistes] [Albums] [Artistes] [Playlists] [+]  │  ← filtres type
│  [Ma bibliothèque ☆]   [Provider : Tous ▾]            │  ← filtres contexte
└────────────────────────────────────────────────────────┘

Résultats organisés en sections verticales :
  ● Artistes (2)        → cards horizontales scrollables
  ● Albums (5)          → grille 3 col
  ● Pistes (10)         → liste compacte avec artiste + durée
  ● Playlists (3)       → cards horizontales
  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  ● Radios (4)          → section pliée par défaut
  ● Podcasts (2)        → section pliée par défaut
```

**Règles clés :**
1. **Radios et Podcasts ne s'affichent PAS par défaut** dans les résultats de recherche musicale — ils apparaissent dans une section "Autres" dépliable
2. **Un badge provider** (ex : `SPOTIFY`, `DEEZER`) sur chaque résultat permet d'identifier l'origine
3. **Bouton "Radio Mode"** visible dès la recherche sur les pistes/artistes compatibles
4. **"Bibliothèque seulement"** comme chip rapide pour chercher dans ses favoris
5. Les **sections vides** sont masquées (pas de section "Albums (0)")
6. **Hint contextuel** : si l'utilisateur tape "jazz", proposer "Parcourir le genre Jazz →" (lien vers le genre discovery MA v2.8)

### Ce qu'on ne devrait PAS présenter ensemble

| Ne pas mélanger | Raison |
|-----------------|--------|
| Radios + Pistes dans la même liste | Nature fondamentalement différente (live vs fichier) |
| Podcasts + Albums | Navigation et actions différentes (progression, chapitres) |
| Audiobooks + Pistes normales | Durée, chapitres, UI dédiée nécessaire |
| Browse filesystem + Bibliothèque | Le browse est une arborescence, la bibliothèque est une liste plate filtrée |
| Résultats "tout catalogue" + "favoris" sans label | L'utilisateur ne sait pas si l'item est dans sa bibliothèque ou non |

---

## 5. Priorité d'implémentation suggérée

| Priorité | Évolution | Impact UX | Complexité |
|:--------:|-----------|:---------:|:----------:|
| 1 | Séparer Radios de la section Bibliothèque musicale | Fort | Faible |
| 2 | Badges provider sur les résultats de recherche | Moyen | Faible (champ déjà dans l'API) |
| 3 | Filtres "type de résultat" dans la recherche | Fort | Moyen |
| 4 | Section Podcasts/Audiobooks conditionnelle | Moyen | Moyen |
| 5 | Chip provider dans la bibliothèque | Moyen | Moyen |
| 6 | Badge qualité lossless sur les items | Faible | Faible |
| 7 | Indicateur Radio Mode sur artistes/playlists | Faible | Moyen |
| 8 | Hint "Parcourir le genre" dans la recherche | Faible | Élevé |
