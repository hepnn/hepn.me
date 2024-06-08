---
title: "PackMate"
description: "Your Personal Packing Assistant"
date: "03/18/2024"
demoURL: "https://packmate.app"
icon: "/packmate-icon.webp"
---

---
PackMate is an app which helps you pack for your trips. It features checklist creation, collaboration, template creation, and more. 
 
## Preview and Links

![PackMate Screens](/artboard.png)

- [Landing page](https://packmate.app)
- [Play Store](https://play.google.com/store/apps/details?id=com.ouji.packmate)

--- 
## Features

- Dynamic category icon generation based on user input
    - This is done by making an API call to [iconify.design](https://iconify.design) and using the returned svg as the icon
- Realtime collaboration between users
    - Done with Firebase Realtime Database
- Local notifications
    - Users are reminded to pack items at a certain time
- Home Widgets
    - Created home widgets in native kotlin, which are then connected to Flutter by method channels
- Google Sign In and Data Sync
    - Users can sign in with their Google account and sync their data across devices
- In-app purchases
    - Added google play billing library to allow users to purchase premium features
- Localisation in multiple languages
- Theming
    - Users can choose between light and dark mode
- Statistics
    - Statistics are calculated based on users checklist habits
- Template creation
    - Users can create templates for their trips
- Future plans
    - iOS release
    - Use of ML for statistics and smart suggestions

---
## Tech Stack

The app is built using Flutter, but home widgets are created in native kotlin. Firebase is used for the backend, and the app uses Google Sign In for authentication. The app also uses the Google Play Billing Library for in-app purchases. The state managment is handled by BLoC.


 

