# Transcription de la vidéo de présentation

> Transcription de [`video-presentation.mp4`](video-presentation.mp4) (9 min 41 s), réalisée avec Whisper (modèle large-v3, en local) puis relue.
> Seuls les noms techniques mal reconnus par Whisper ont été corrigés (n8n, n8ncli, Gemini, Hunter, Claude Code, pull, `--dry-run`…). Les passages incompréhensibles sont signalés par *[passage peu clair]*.

## Introduction

**[00:00]** Bonjour Lucas, bonsoir plutôt, comment ça va ? Excuse-moi pour le retard de cette vidéo, je te l'ai faite sur mon dictaphone tout simplement.

**[00:10]** Du coup, dans cette vidéo, comme tu me l'as demandé, je vais te présenter mon robot, mon projet, pardon. C'est une automatisation faite sur n8n, dans un workflow, qui va faire de la prospection commerciale à ma place, tout simplement. Il va trouver des clients potentiels sur Internet, il va vérifier s'ils correspondent à ma cible, leur écrire un mail personnalisé et les relancer tout seul.

**[00:34]** Du coup, je ne t'apprends rien, tu nous l'as demandé : ça tourne sur n8n, outil d'automatisation, et je l'ai piloté, pour le coup, ce projet, avec n8ncli.

## Le problème

**[00:47]** Je te présente un petit peu le problème, pourquoi j'ai créé ce robot, entre guillemets. En gros, c'est parce que je vends des systèmes speed-to-lead. Je ne les vends pas encore, mais je compte le faire. C'est toi qui m'as appris ça, du coup je ne t'apprends rien.

**[01:07]** Quand quelqu'un remplit un formulaire sur le site d'un entrepreneur, il faut le recontacter très vite, sinon il part ailleurs, et tu perds des clients potentiels. Et les prospects que je vais démarcher, c'est des coachs, des consultants et des formateurs qui vendent sur les réseaux sociaux, qui utilisent à 90 % les réseaux.

**[01:30]** Et du coup, les trouver et leur écrire un message sur mesure à la main, à entre 50 et 100 personnes, c'est chronophage, ça prend des heures et c'est ultra chiant. Du coup, moi, j'ai tout automatisé, tout simplement.

## Comment le robot est construit

**[01:47]** Là, je vais te montrer très rapidement comment il est construit. Je vais aller dans Prospection Daily Run. Voilà le workflow principal, qui s'appelle Prospection Daily Run. Il se lance avec un déclencheur, pardon, deux déclencheurs. Je vais zoomer un petit peu.

**[02:16]** Donc là, tu as le déclencheur manuel, et juste ici, tu as le déclencheur qui s'exécute automatiquement : il se déclenche tous les jours à 9 h, ou avec un bouton.

**[02:34]** Ici, tu as le modèle IA, donc Gemini, que tu nous as demandé de mettre (Gemini, GPT, peu importe). Gemini, ici, invente les recherches web à partir de ma cible. Et tu as Firecrawl, qui va les lancer. Puis tu as un bloc de code qui enlève les doublons et les sites qui sont hors sujet.

**[02:55]** Je vais dézoomer un petit peu. Chaque entreprise, en fait, va passer dans le deuxième workflow, qui est Qualify Company, juste ici. Après avoir fait des recherches avec Gemini, chaque entreprise va passer dans ce deuxième workflow *[passage peu clair]*, et l'IA va lui donner une note sur 100. Si la note est assez haute (on a plafonné à environ 60, donc si la note est supérieure à 60), le bloc Hunter va trouver le mail et vérifier l'email du décideur.

**[03:42]** Ensuite, tout simplement, l'IA va rédiger le mail et deux mails de relance, si le décideur n'a pas répondu. Il y a ensuite un contrôle qui vérifie le texte, et Gmail envoie le mail et les deux relances si le prospect n'a pas répondu, tout simplement.

**[04:14]** Dans ces workflows-là, l'IA n'intervient qu'aux trois endroits où elle doit réfléchir. Tout le reste, ce sont des règles qui ont été fixées, tout simplement. Elle intervient là, je vais zoomer un petit peu, elle intervient là, et elle intervient dans le workflow précédent, juste ici. Du coup, elle intervient trois fois.

## Démonstration

**[04:52]** Là, je vais te montrer : je vais exécuter le workflow, tout simplement. Ça va prendre un petit peu de temps. Le workflow, comme tu peux voir, tous les nœuds sont au vert : il s'est bien exécuté. Je vais mettre une capture d'écran du mail que n8n a envoyé.

**[05:17]** Ensuite, je vais aller dans le tableau de prospection, qui se trouve dans Prospection Prospects, dans les Data Tables. On va aller dans la colonne Status, juste ici. Et voilà, on peut voir le statut des prospects, la raison pour laquelle le mail a été envoyé ou non, est-ce que c'est une erreur ou pas, bref, leur statut, tout simplement.

**[06:11]** Pour celles qui correspondent, l'email est rédigé avec une phrase sur leur activité, une proposition d'appel de 15 minutes, et la mention de désinscription obligatoire en France. Dans tous les cas, je vais mettre la capture d'écran qui va montrer le tout. Pour le mail que j'ai reçu, vu que c'était un test, tu verras sur la capture, il y aura marqué « test », tout en gros.

## n8ncli

**[06:39]** Bon, là, on va passer à la partie plus technique, donc tout ce qui est n8ncli. Juste avant ça : je ne suis pas trop à l'aise techniquement avec le fait de taper les commandes de n8ncli, comme tu l'as dit à Apolline, du coup je vais simplement expliquer les commandes.

**[07:03]** n8ncli, c'est un petit peu comme un MCP : c'est une sorte de prise qui permet de relier Claude Code à n8n, pour que Claude Code puisse piloter directement notre workflow à notre place. Chaque workflow devient une sorte de fichier TypeScript, comme celui-ci, avec ses blocs, ses connexions, etc.

**[07:38]** Ça marche un petit peu comme Git, et il y a plusieurs commandes :
- `init`, qui permet de relier mon dossier, donc mon workflow, à n8n ;
- `pull`, qui permet de récupérer les workflows ;
- `status` et `diff`, qui montrent ce que j'ai modifié ou pas ;
- `validate`, qui permet de vérifier le fichier ;
- `push`, qui envoie le fichier sur n8n, avec `--dry-run` pour simuler l'envoi ;
- `exec`, qui lance un workflow depuis le terminal ;
- `publish`, qui va l'activer pour qu'il puisse tourner tout seul.

**[08:23]** J'ai dû aussi contourner quelques limites, parce que dans mon workflow, `exec` refusait le workflow à plusieurs déclencheurs. Donc j'ai créé un workflow Run Now qui l'appelle. Et vu que mon essai n8n Cloud est terminé, j'ai installé n8n sur mon PC et j'ai réimporté tous mes workflows en quelques commandes, justement parce qu'ils sont en code. Comme tu peux le voir, j'ai pu le mettre sur VS Code avec Claude Code, qui est juste ici, et un fichier *[passage peu clair]*.

## Garde-fous et conclusion

**[08:56]** Comme le robot écrit à de vraies personnes, il a un mode test, comme je t'ai dit, avec la capture d'écran concernant les mails : tout arrive chez moi. Il y a un plafond d'emails chaque jour (je l'ai plafonné à 40 mails par jour), uniquement des adresses vérifiées, et un interrupteur pour tout arrêter.

**[09:22]** En conclusion, pour résumer, c'est un robot qui trouve, qui qualifie et qui va contacter les prospects tout seul, avec l'IA seulement là où elle sert. Le code, les README et les skills sont tous sur mon GitHub. Et merci de m'avoir écouté.
