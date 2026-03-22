# Installation dans Home Assistant

## Prérequis

1. **Home Assistant** 2024.1+ (2025.x recommandé)
2. **Music Assistant** intégration installée et configurée
   - Via HACS : chercher "Music Assistant"
   - Ou via [le dépôt officiel](https://github.com/music-assistant/home-assistant)
3. Au moins un player configuré dans Music Assistant

---

## Étape 1 — Copier le dossier custom_components

### Option A — Copie manuelle (SSH / Samba)

Copie le dossier `custom_components/my_music_library/` dans le répertoire
`custom_components/` de ta configuration HA :

```
/config/custom_components/my_music_library/
├── __init__.py
├── manifest.json
├── config_flow.py
├── const.py
├── strings.json
├── translations/
│   └── en.json
└── www/
    └── my-music-library-card.js
```

Si le dossier `custom_components/` n'existe pas encore :
```bash
mkdir -p /config/custom_components
```

### Option B — Via le terminal HA (add-on SSH)

```bash
# Depuis le répertoire du projet sur ta machine
scp -r custom_components/my_music_library homeassistant.local:/config/custom_components/
```

---

## Étape 2 — Redémarrer Home Assistant

**Paramètres → Système → Redémarrer**

Ou via le terminal :
```bash
ha core restart
```

---

## Étape 3 — Ajouter l'intégration

1. Aller dans **Paramètres → Appareils et services → Ajouter une intégration**
2. Chercher **"My Music Library"**
3. Dans le formulaire :
   - **Default player device** : laisse vide pour auto-détection, ou sélectionne un player MA
   - **Default tab** : onglet affiché au démarrage (Player / Search / Library)
4. Valider

> L'intégration va automatiquement enregistrer la carte Lovelace comme ressource.

---

## Étape 4 — Ajouter la carte au tableau de bord

### Option A — Via l'interface (recommandé)

1. Aller sur un dashboard Lovelace en mode édition (crayon en haut à droite)
2. Cliquer **+ Ajouter une carte**
3. Faire défiler jusqu'à **My Music Library** (ou chercher "music")
4. Valider

### Option B — Via YAML

Éditer le dashboard et ajouter :

```yaml
type: custom:my-music-library-card
# Optionnel :
entity: media_player.ton_player_ma   # forcer un player spécifique
default_tab: player                  # player | search | library
```

---

## Étape 5 — Vérifier que la ressource Lovelace est bien enregistrée

Si la carte n'apparaît pas :

1. Aller dans **Paramètres → Tableaux de bord → (menu ⋮) → Ressources**
2. Vérifier la présence de `/my_music_library/my-music-library-card.js` (type : Module)
3. Si absent, cliquer **+ Ajouter une ressource** et entrer :
   - URL : `/my_music_library/my-music-library-card.js`
   - Type : **JavaScript module**
4. Rafraîchir le navigateur (Ctrl+Shift+R / Cmd+Shift+R)

---

## Dépannage

### La carte s'affiche en blanc / erreur "Custom element not found"
→ La ressource JS n'est pas chargée. Voir Étape 5.

### "Music Assistant players not found"
→ Vérifie que l'intégration Music Assistant est installée et qu'au moins un player est configuré.

### Les commandes ne fonctionnent pas
→ Le player MA doit être dans l'état `playing` ou `idle` (pas `unavailable`).
→ Vérifie que Music Assistant server est démarré (add-on HA ou serveur externe).

### Les logs HA
Aller dans **Paramètres → Système → Logs** et filtrer sur `my_music_library`.

---

## Structure des fichiers résultants

```
/config/
├── custom_components/
│   └── my_music_library/        ← intégration Python
│       └── www/
│           └── my-music-library-card.js   ← card JS servie par HA
└── configuration.yaml           ← aucune modification nécessaire
```
