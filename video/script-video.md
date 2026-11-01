# Script de la vidéo de présentation

> **À propos de ce texte** : c'est le **script de référence** lu pendant la vidéo [`video-presentation.mp4`](video-presentation.mp4), et non une transcription mot à mot. Le propos réel peut différer légèrement, avec des reformulations et des passages improvisés.
>
> Une transcription automatique a été tentée avec Whisper (modèles large-v3-turbo puis large-v3, avec détection de voix), mais le son de l'enregistrement, trop faible et trop lointain, a produit un texte inexploitable. Il n'a donc pas été publié.

Durée de la vidéo : 10 min 22 s.

## 1. Introduction

*À l'écran : n8n, page Overview.*

« Bonjour ! Je m'appelle Vladimir, et dans cette vidéo je vais vous présenter mon projet : un robot qui fait de la prospection commerciale à ma place. Il trouve des clients potentiels sur internet, il vérifie s'ils correspondent à ce que je cherche, il leur écrit un email personnalisé, et il les relance tout seul. Le tout tourne sur n8n, un outil d'automatisation, et je l'ai piloté depuis mon terminal avec un outil qui s'appelle n8ncli. Je vais vous montrer comment c'est construit, je vais le lancer en direct, et je finirai par les commandes. »

## 2. Le problème et la solution

*À l'écran : la page Overview, la souris sur les workflows Prospection.*

« D'abord, le contexte. Je vends des systèmes qu'on appelle speed-to-lead. L'idée est simple : quand quelqu'un remplit un formulaire sur le site d'un entrepreneur, il faut le recontacter très vite, sinon il part ailleurs. Mes clients, ce sont donc des coachs, des consultants, des formateurs qui vendent sur les réseaux. Le problème, c'est que trouver ces gens, lire leur site et leur écrire un message sur mesure, à la main, ça prend des heures. Donc j'ai automatisé tout ça. »

## 3. Comment le robot est construit

*À l'écran : le workflow Daily Run, puis Qualify Company.*

« Voici le cœur du projet, le workflow Daily Run. Un workflow, c'est une suite de blocs qui s'exécutent les uns après les autres. Et rien ne se passe tant qu'il n'y a pas de déclencheur. Ici, j'en ai deux : un planning, chaque jour de semaine à 9 heures, et un bouton pour le lancer à la main.

Ensuite, le robot lit sa configuration. Là, une IA, Gemini, invente des recherches web à partir de ma cible. Firecrawl lance ces recherches. Puis ce bloc de code fait le tri : il enlève les réseaux sociaux, les médias, les entreprises déjà contactées.

Chaque entreprise retenue passe dans ce deuxième workflow. Il lit le site, et l'IA lui donne une note sur 100 en expliquant pourquoi. Si la note est assez haute, Hunter trouve l'email du décideur et vérifie qu'il existe vraiment.

De retour dans Daily Run, l'IA rédige l'email et deux relances. Puis un contrôle automatique vérifie le texte avant l'envoi par Gmail. Et ce qui est important pour moi : l'IA n'est utilisée qu'aux trois endroits où il faut vraiment réfléchir. Tout le reste, ce sont des règles fixes, donc prévisibles. »

## 4. Démo en direct

*À l'écran : Daily Run en cours d'exécution, puis la table Prospection Prospects et la boîte mail.*

« Je lance le robot. On voit les blocs s'allumer en vert un par un. Là, il génère les recherches… là, il cherche sur le web… et là, il qualifie les entreprises une par une. Ça prend quelques minutes, parce qu'il lit vraiment chaque site.

C'est terminé, tout est vert. Allons voir le résultat dans la base de données.

Chaque ligne, c'est une entreprise analysée. Regardez la colonne status : certaines sont "not_qualified", et la colonne reason explique pourquoi. Par exemple ici, c'est un grand cabinet de recrutement, donc hors cible. Et là, on a "sent" : l'email est parti.

Comme je suis en mode test, l'email arrive chez moi et pas chez le prospect. L'objet indique à qui il aurait été envoyé. On voit qu'il commence par une phrase sur l'activité de la personne, qu'il propose un échange de 15 minutes, et qu'il finit par la mention pour se désinscrire, qui est obligatoire en France. »

## 5. Les commandes n8ncli

*À l'écran : VS Code, le fichier `Prospection Daily Run.workflow.ts`.*

« Maintenant, la partie technique. Tout ce que vous venez de voir, je ne l'ai pas construit à la souris. Je l'ai écrit en code, et je l'ai envoyé sur n8n avec un outil qui s'appelle n8ncli.

n8ncli, c'est un outil en ligne de commande : on l'utilise dans le terminal, en tapant des instructions. Son rôle, c'est de faire le pont entre mon ordinateur et mon compte n8n. Chaque workflow devient un fichier TypeScript, comme celui-ci. Chaque bloc est décrit avec son type et ses réglages, et en bas du fichier, on voit comment les blocs sont reliés entre eux.

L'avantage, c'est que mon robot devient du vrai code. Je peux le modifier dans un éditeur, le vérifier, le sauvegarder sur GitHub, et revenir en arrière si je casse quelque chose.

Pour fonctionner, n8ncli se connecte à mon compte n8n une fois pour toutes, avec une clé d'accès. Ensuite, tout marche un peu comme Git, si vous connaissez.

Avec la commande pull, je récupère mes workflows depuis n8n vers mon ordinateur. Avec push, je fais l'inverse : j'envoie mes modifications sur n8n. Entre les deux, status me dit ce que j'ai modifié et pas encore envoyé, et validate vérifie mon fichier avant l'envoi, un peu comme un correcteur d'orthographe pour le code. Ça m'a évité plein d'erreurs.

Il y a aussi exec, qui lance un workflow directement depuis le terminal, sans ouvrir n8n.

Et enfin, une question importante : comment on active le robot pour qu'il tourne tout seul ? Sur n8n, on dit qu'on publie le workflow, avec la commande publish. Tant qu'un workflow n'est pas publié, son planning de 9 heures ne se déclenche pas : seul le bouton manuel marche. Une fois publié, il tourne chaque jour de semaine, même si mon ordinateur est éteint, puisque n8n est en ligne. Et si je veux l'arrêter, j'utilise unpublish.

Pour activer toute la prospection, il suffit de publier trois workflows : le pipeline principal, les relances, et les alertes d'erreur. »

## 6. Garde-fous et limites

*À l'écran : la table Prospection Config.*

« Comme ce robot envoie des emails à de vraies personnes, j'ai mis des sécurités. Le mode test, que vous avez vu. Un plafond d'emails par jour, pour ne pas être considéré comme du spam. Seules les adresses vérifiées sont utilisées. Et un interrupteur qui arrête tout. Côté limites, les relances n'ont pas encore été testées en conditions réelles, et les versions gratuites des services limitent le nombre de prospects par mois. »

## 7. Conclusion

*À l'écran : la page Overview.*

« Voilà ! En résumé, j'ai construit un robot qui trouve, qualifie et contacte des prospects tout seul, en n'utilisant l'IA que là où elle sert vraiment. Le code de tous les workflows et le README sont sur mon GitHub. Merci de m'avoir regardé ! »
