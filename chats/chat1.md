# Application de révision minimaliste

_Started 2026-08-23 19:56 UTC_

---

## User

Design a mobile app for : 
Regarde le fichier MD et propose moi une version de mon application de révision.
il faut qu'elle soit minimaliste.

## Assistant

I'll start by exploring the attached design system.

_[tool: list_files]_

Le design system attaché est vide — je m'appuie donc sur la charte du MD.

_[tool: copy_starter_component]_

_[tool: grep]_

_[tool: dc_write]_

_[tool: show_html]_

_[tool: ready_for_verification]_

Version v1 en place : nuage de 60 verbes (taille = fréquence, point rouge = irrégulier), recherche temps réel, 3 filtres, et fiche à 4 temps en grille singulier/pluriel avec terminaisons en rouge, encart faux ami au-dessus du Composto.

Deux choix que j'ai faits, à valider : les 6 personnes sont en 2 colonnes (eu/nós, tu/vós, ele/eles) pour tenir en un scroll court ; les réguliers sont générés depuis le radical (avec les exceptions orthographiques : cheguei, comecei, fiquei) plutôt que saisis un par un. Dis-moi si tu veux des variantes de l'écran d'accueil (nuage vs liste alphabétique) ou un mode sombre.

## User

Found issues — fixing…

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Zone de sécurité ajoutée : le contenu commence à 54px et les en-têtes collants se posent sous la barre d'état au lieu de passer dessous.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: dc_html_str_replace]_

Corrigé : accord du compteur ("1 verbe") et pronoms un peu plus lisibles (11px/600, or plus foncé).

## User

quels sont les petits détails (amélioration) qui peuvent faire la différence selon toi ?

## Assistant

Sans toucher au périmètre v1, les détails qui compteraient le plus :

**Mémorisation**
- Souligner la personne qui « piège » : `nós` au Presente et au Pretérito Perfeito Simples de -ER/-IR sont identiques (comemos/comemos, partimos/partimos). Un petit marqueur discret sur les formes ambiguës.
- Afficher le verbe modèle en filigrane sur une fiche régulière (« se conjugue comme falar »), cliquable.
- Pour les irréguliers dont seul le présent est irrégulier, marquer les 3 autres tableaux « régulier » — ça rassure et réduit la charge.

**Navigation**
- Précédent/suivant en bas de fiche pour enchaîner sans revenir au nuage.
- Mémoriser le dernier verbe consulté et le filtre dans localStorage (réouverture = reprise immédiate).
- Recherche insensible aux accents (`pos` → `pôr`), et recherche aussi sur le français.

**Détails d'interface**
- Le nuage tel quel est joli mais dur à balayer à plus de 60 verbes : garder les 12-15 plus fréquents en grand, les autres en petit et triés — ou proposer une bascule nuage/liste.
- Tap cible : les petits verbes (15px) sont sous les 44px recommandés ; ajouter du padding invisible.
- Copier une conjugaison au appui long (pratique pour coller dans un carnet).
- Retour haptique/transition très courte (80 ms) entre les deux écrans, sinon le passage paraît sec.

**Contenu**
- Une phrase d'exemple par verbe au Pretérito Perfeito Composto, plutôt que l'exemple générique de `falar` réutilisé partout.
- Marquer `vós` comme rare à l'oral (utile en PT-PT écrit, mais Baptiste ne l'entendra pas) — un simple ton plus clair suffit.

Dis-moi lesquels tu veux, je les intègre.

## User

allez fait les modifications

## Assistant

_[tool: dc_write]_

_[tool: ready_for_verification]_

Tout est intégré :

- marqueur ≡ sur `nós` quand la forme est identique au Presente, avec légende sous le tableau
- badge « régulier » sur les temps réguliers d'un verbe irrégulier
- « se conjugue comme *falar* » cliquable sur les fiches régulières
- précédent/suivant en bas de fiche (ordre alphabétique)
- reprise à l'ouverture : dernier verbe, filtre et mode gardés en mémoire
- recherche sans accents et sur le français (`pos` → pôr, `manger` → comer)
- bascule Nuage / Liste alphabétique en haut à droite
- cibles tactiles agrandies dans le nuage, lignes de liste à 48px
- appui long sur un tableau = conjugaison copiée, avec confirmation
- exemples du faux ami générés depuis le verbe affiché (plus l'exemple de *falar* partout)
- `vós` atténué (rare à l'oral)

## User

n'y a t-il pas une incohérence entre passé composé et passé simple ?

## Assistant

Oui, bien vu — et c'est un piège de nommage. Le *Pretérito Perfeito **Simples*** est ce qui se traduit par le passé **composé** français (`falei` = « j'ai parlé »), alors que le *Perfeito **Composto*** ne se traduit pas par le passé composé. Mes libellés mettaient les deux noms français côte à côte, ce qui brouille tout. Je remplace les noms de grammaire par la forme concrète.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Corrigé. Le libellé du *Perfeito Simples* dit maintenant « action terminée · le vrai "j'ai fait" » et celui du *Composto* « action qui dure encore · pas "j'ai fait" » — le contraste est explicite au lieu d'opposer deux noms de grammaire qui se ressemblent.

