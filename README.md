## Un exemple d'implémentation du bouton FranceConnect sur le site web d'un fournisseur de services

![enter image description here](https://api.gouv.fr/img/logo-fc.png)

[FranceConnect](https://api.gouv.fr/api/franceconnect.html)

Le bouton **FranceConnect** a deux utilisations dans cet exemple : 

1) Identifier l'utilisateur

2) Obtenir son consentement à l'échange de données personnelles

## Description

## Qu’est-ce que FranceConnect ?

FranceConnect est un dispositif qui permet aux internautes de s’identifier sur un service en ligne par l’intermédiaire d’un compte existant (impots.gouv.fr, ameli.fr…).

L’authentification est transparente pour une application utilisant FranceConnect (elle ne converse jamais directement avec le fournisseur d’identité, c’est FranceConnect qui s’en charge).

FranceConnect fournit au service en ligne l’identité vérifiée d’une personne physique, appelée l’identité pivot.

## A qui s’adresse FranceConnect ?

FranceConnect cible les partenaires suivants :

-   Fournisseurs de services : Vous proposez des services en ligne aux usagers.
-   Fournisseurs d’identité : Vous garantissez l’identification et l’authentification d’un usager.
-   Fournisseurs de données : Vous transmettez des données aux fournisseurs de service suite au consentement de l’usager.

## Événement FranceConnect

[Retrouvez tous les prochains événements FranceConnect](https://partenaires.franceconnect.gouv.fr/evenements)

## Sites de démonstration

### Tester l’identification avec FranceConnect du point de vue usager

1.  se rendre sur le site de test : [https://service-provider-example.herokuapp.com/](https://service-provider-example.herokuapp.com/)
2.  cliquer sur “se connecter” puis sur “s’identifier avec FranceConnect”
3.  choisir “identity-provider-example” comme fournisseur d’identité
4.  utiliser les identifiants suivants : 3_melaine | 123 (d’autres identifiants de test sont disponibles [ici](https://github.com/france-connect/identity-provider-example/blob/master/data/database.csv), le mot de passe est toujours 123)
5.  une fois revenu sur le site, vous êtes connecté

### Tester l’échange de données avec FranceConnect du point de vue usager

1.  sur le site de test, cliquer sur le bouton “récuperer mes données via FranceConnect”
2.  dans la mire FranceConnect de consentement d’échange de données, cliquer sur “Accepter”
3.  vous devriez voir apparaître les données relatives à l’identifiant FranceConnect choisi (d’autres données sont disponibles [ici](https://github.com/france-connect/data-provider-example/blob/master/database.csv))

### Test du point de vue fournisseur de service

L’interface qui est en ligne peut être installée sur votre poste de travail, ce qui vous permettra de voir :

-   les échanges entre FranceConnect et le FS
-   les échanges entre le FS et l’API de test Impôts Particulier
-   les échanges entre l’API de test Impôts Particulier et FranceConnect

Le code et la procédure d’installation sont disponibles sur notre dépôt de code github : [https://github.com/france-connect/service-provider-example/](https://github.com/france-connect/service-provider-example/).

## Accès

OUVERT sous contrat pour :

-   particuliers
-   entreprises
-   collectivités

## Support

Vous pouvez contacter le support de cette API par email.

## Supervision

Les moniteurs de cette API ne sont pas disponibles publiquement.

## Limitations d'usage

Les limitations d'usage de cette API ne sont pas disponibles publiquement.

## Partenaires

-   DGFiP
-   IDN

## Documentation technique

Documentation au format OpenAPI non renseignée, vous pouvez retrouver la documentation technique sur [le site de l'API](https://partenaires.franceconnect.gouv.fr/fcp/fournisseur-service)
