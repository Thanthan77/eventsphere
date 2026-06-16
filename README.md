# EventSphere

EventSphere est une application web permettant d’organiser des événements, gérer des participants et créer des sondages collaboratifs.  
Le projet utilise **Supabase** pour l’authentification et la base de données **PostgreSQL**.  
Le frontend est développé en **HTML / CSS / JavaScript**, et le site est déployé via **GitHub Pages**.

---

##  Fonctionnalités principales

###  Authentification & comptes
- Inscription par **email / mot de passe**
- Connexion par **email / mot de passe**
- Connexion via **Google (OAuth)** (Supabase)
- Gestion automatique des sessions
- Redirection des utilisateurs non connectés
- Déconnexion sécurisée

---

###  Gestion des événements
- Création d’un événement (titre, description, type)
- Types disponibles : **Public** / **Privé**
- Liste des événements de l’utilisateur
- Filtrage : Tous / Public / Privé
- Page de détail d’un événement
- Gestion des participants :
  - Ajout d’un membre
  - Retrait d’un membre
  - Affichage du créateur
- Suppression d’un événement
- Cartes d’événements modernes et responsives

---

### 🗳️ Sondages intégrés
- Création d’un sondage lié à un événement
- Ajout d’options personnalisées
- Vote pour une option
- Modification du vote
- Affichage du nombre total de votes
- Page “Mes sondages”
- Page de détail d’un sondage
- Boutons d’action : voter, changer son vote, ajouter une option

---

###  Gestion du profil utilisateur
- Affichage du nom et de l’email
- Modification du nom
- Sauvegarde dans PostgreSQL
- Zone dangereuse : suppression du compte
- Avatar généré automatiquement

---

###  Backend & base de données

####  Supabase
- Authentification (email + Google)
- Gestion des sessions
- API REST automatique
- Sécurité via Row Level Security (RLS)

####  PostgreSQL
- Table `users`
- Table `events`
- Table `participants`
- Table `polls`
- Table `poll_options`
- Table `votes`
- Relations complètes entre utilisateurs / événements / sondages

---

##  Version mobile (en développement)
- Menu hamburger
- Sidebar coulissante
- Overlay cliquable pour fermer
- Optimisation progressive des pages mobiles

> La version desktop est entièrement fonctionnelle.  
> La version mobile est en cours d’amélioration.

---

##  Structure du projet

```txt
/css
  ├── general.css
  ├── dashboard.css
  ├── events.css
  ├── polls.css
  ├── settings.css

/js
  ├── utils/
  │     └── sidebarMobile.js
        └── supabase.js
  ├── pages/
        ├── dashboard.js
        ├── events.js
        ├── polls.js
        ├── pollDetail.js
        ├── eventDetail.js
        ├── settings.js
        ├── auth.js
        └── logout.js

/pages
  ├── dashboard.html
  ├── events.html
  ├── polls.html
  ├── pollDetail.html
  ├── eventDetail.html
  ├── settings.html
  └── auth.html
```
```
##  Liens importants

| Type               | Lien                                                                 |
|--------------------|----------------------------------------------------------------------|
| **Site déployé**   | [https://thanthan77.github.io/eventsphere/](https://thanthan77.github.io/eventsphere/)           |
| **Repository GitHub** | [https://github.com/Thanthan77/eventsphere](https://github.com/Thanthan77eventsphere) |
