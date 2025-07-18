---
title: 'Get contact’s profile picture inside ManyChat'
date: 2021-12-08T17:09:10-06:00
image: '/images/blog/2021/get-contacts-profile-picture-inside-manychat/cover.webp'
tags: [manychat]
draft: false
description: 'Get the profile picture of your ManyChat contacts. One simple action, without the technical fuzz of an external request'
---

## 📖 Table of Contents

- [👋 Greetings](#greetings)
- [📜 Terms and Conditions](#terms-and-conditions)
- [👓 Privacy Policy](#privacy-policy)
- [🛠️ Initial Setup](#initial-setup)
- [⚡ Actions](#actions)
    - [🙂 Get Profile Picture](#get-profile-picture)

---

<span id="greetings"></span>

## 👋 Greetings

Hello and welcome! Thank you for your interest in Monet.

This App uses ManyChat’s API to get the profile picture URL of your contacts. You will need a ManyChat Pro Account and since you are consuming ManyChat’s API directly, you have to be aware of <a href="https://support.manychat.com/support/solutions/articles/36000070776-manychat-api#Is-there-any-limit-to-a-number-of-API-calls?" target="_blank" rel="nofollow">ManyChat’s API limits ➡</a>. The API used my Monet App is `fb/subscriber/getInfo` which is limited up to 10 RPS (request per second).

The API usage limit is OK for most use cases, just be careful if you are doing something massive 😉

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/0-monet-description.webp" alt="Artwork by Monet accompanied by text: 'One simple action without the technical fuzz of an external request' related to a ManyChat application." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/1-monet-setup.webp" alt="Background artwork by Monet with a laptop displaying the ManyChat app configuration screen for entering the API key." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/2-monet-actions.webp" alt="Background artwork by Monet with a laptop showing the various actions available in the ManyChat app." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/3-monet-expanded-actions.webp" alt="Background artwork by Monet with a laptop showing the configuration settings for retrieving the user profile picture URL in the ManyChat app." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/4-monet-flow.webp" alt="Background artwork by Monet with a laptop showing the ManyChat app flow featuring the action to retrieve the user profile picture URL." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/5-monet-phone.webp" alt="Background artwork by Monet with a phone displaying the Messenger app showing the user's profile picture in a chatbot conversation." loading="lazy">
  </div>
  <em>Gallery Monet</a></em>
</div>

### 🌐 Install Monet for ManyChat

The following link will send you to the ManyChat App installation page, The only permission needed is `View contact data`, to be able to read the data of the contact's profile picture.

<a href="https://manychat.com/apps/849/install" target="_blank" rel="nofollow">Install Monet ➡</a>

### 💽 Get Monet's Source Code

It has been four years since I created Monet as a simple proyect to understand how to create a small app for ManyChat. The source code is mostly a json configuration file.

<a href="https://github.com/jebucaro/monet-for-manychat" target="_blank" rel="nofollow">Go to GitHub ➡</a>

---

<span id="terms-and-conditions"></span>

## 📜 Terms and Conditions

The «Monet App» is provided to you on an «as is» and «as available» basis without warranties or representations of any kind, express or implied. You as the user are the sole responsible for the use of the ManyChat’s API Key, what operations you do with it, and where you use it. You are aware of the limits and restrictions of using ManyChat’s API and the availability of their services. You also realize that ManyChat will stop your automations if an HTTP Error occours.

IN NO EVENT WILL JONATHAN BÚCARO BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

---

<span id="privacy-policy"></span>

## 👓 Privacy Policy

The «Monet App» does not track data. It’s a bridge or an interface for your ManyChat Flows to consume ManyChat’s API.

---

<span id="initial-setup"></span>

## 🛠️ Initial Setup

Go to your **ManyChat Settings > Extensions > API**. If you haven’t generated an API Key, clic the **Generate Your API Key** button (1) and copy the contents of the **Get API Key** field (2). If you have previusly generated your API Key, just copy it from the **Get API Key** field (2).

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-setup-api-1.webp" alt="ManyChat settings screen showing the option to generate an API key." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-setup-api-generate-1.webp" alt="Close-up of ManyChat settings highlighting the textbox for the API key and the button to generate the key." loading="lazy">
  </div>
  <em>ManyChat – Generate your API Key</em>
</div>

Now go to **ManyChat Settings > Extensions > Apps** and select the **Monet** App. Paste your API Key on the **ManyChat API Key** field (3). Clic **Save** (4). And that’s it!

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-setup-app-select-1.webp" alt="ManyChat settings screen showing a list of installed apps, highlighting the Monet App." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-setup-app-api-1.webp" alt="Focused view of the Monet App settings showing the textbox for pasting the ManyChat API key and the button to save the configuration." loading="lazy">
  </div>
  <em>Monet – Configure your ManyChat API Key</em>
</div>
<span id="actions"></span>

## ⚡ Actions

<span id="get-profile-picture"></span>

### 🙂 Get Profile Picture

- The size of the picture varies with each channel
    - Facebook: 200×200 px
    - Instagram: 200×200 px
    - Telegram: 640×640 px
- ManyChat controls when the photo is obtained, when it is updated and in what channels is available.

#### Output Fields

<div class="table-container">
  <table>
    <tr><th>Field</th><th>Description</th></tr>
    <tr><td>Profile Picture</td><td>The URL to the profile picture will be in this field. Save this to the custom user field of your choice.</td></tr>
  </table>
</div>

#### ⚠️ Tip

It’s safer to validate if the CUF has some value in it. If not, the following causes are the most common:

- An error occurred while consuming ManyChat’s API
- The profile picture attribute isn’t available in the channel you are using

Here is a small basic flow on how to use Monet App.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-flow-sample.webp" alt="ManyChat flow diagram incorporating the Monet App, illustrating the sequence of actions." loading="lazy">
  </div>
  <em>Monet – Flow Sample</em>
</div>

---

The official ManyChat.com website can be found at <a href
="https://manychat.com" target="_blank" rel="nofollow">https://manychat.com/ ➡</a>

I have used the Urban Dictionary definition of Monet as inspiration to name the app 😆

> Like Monet’s paintings… Looks good from afar – but far from good close up
>
> <a href="https://www.urbandictionary.com/define.php?term=Monet" target="_blank" rel="nofollow">Urban Dictionary ➡</a>

Cloude Monet paintings are available in Public Domain.
