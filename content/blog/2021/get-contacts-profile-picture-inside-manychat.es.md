---
title: 'Obten la foto de perfil del contacto dentro de ManyChat'
date: 2021-12-08T17:09:10-06:00
image: '/images/blog/2021/get-contacts-profile-picture-inside-manychat/cover.webp'
tags: [manychat]
draft: false
description: 'Obtén la foto de perfil de tus contactos de ManyChat. Una acción sencilla, sin complicaciones técnicas de una solicitud externa'
translationKey: '2021-get-contacts-profile-picture-inside-manychat'
slug: 'obten-la-foto-de-perfil-del-contacto-dentro-de-manychat'
---

## 📖 Table of Contents

- [👋 Saludos](#saludos)
- [📜 Términos y Condiciones](#terminos-y-condiciones)
- [👓 Política de Privacidad](#politica-de-privacidad)
- [🛠️ Configuración Inicial](#configuracion-inicial)
- [⚡ Acciones](#acciones)
    - [🙂 Obtén la Foto de Perfil](#obten-la-foto-de-perfil)

---

<span id="saludos"></span>

## 👋 Saludos

¡Hola y bienvenido! Gracias por tu interés en Monet.

Esta App usa la API de ManyChat para obtener la URL de la foto de perfil de tus contactos. Necesitarás una cuenta ManyChat Pro y, dado que estás consumiendo la API de ManyChat directamente, debes estar al tanto de <a href="https://support.manychat.com/support/solutions/articles/36000070776-manychat-api#Is-there-any-limit-to-a-number-of-API-calls?" target="_blank" rel="nofollow">los límites de API de ManyChat ➡</a>. La API que usa Monet es `fb/subscriber/getInfo`, la cual está limitada a 10 RPS (solicitudes por segundo).

El límite de uso de la API es adecuado para la mayoría de los casos, solo ten cuidado si haces algo masivo 😉

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/0-monet-description.webp" alt="Arte de Monet acompañado por texto: 'Una acción sencilla sin complicaciones técnicas de una solicitud externa' relacionada con una aplicación ManyChat." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/1-monet-setup.webp" alt="Arte de fondo de Monet con un laptop mostrando la pantalla de configuración de ManyChat para ingresar la clave API." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/2-monet-actions.webp" alt="Arte de fondo de Monet con un laptop mostrando las acciones disponibles en la app ManyChat." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/3-monet-expanded-actions.webp" alt="Arte de fondo de Monet con un laptop mostrando la configuración para obtener la URL de la foto de perfil del usuario en la app ManyChat." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/4-monet-flow.webp" alt="Arte de fondo de Monet con un laptop mostrando el flujo de ManyChat con la acción para obtener la URL de la foto de perfil del usuario." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/5-monet-phone.webp" alt="Arte de fondo de Monet con un teléfono que muestra la app Messenger con la foto de perfil del usuario en una conversación chatbot." loading="lazy">
  </div>
  <em>Galería Monet</em>
</div>

### 🌐 Instala Monet para ManyChat

El siguiente enlace te llevará a la página de instalación de la app ManyChat. El único permiso necesario es `View contact data`, para poder leer los datos de la foto de perfil del contacto.

<a href="https://manychat.com/apps/849/install" target="_blank" rel="nofollow">Instalar Monet ➡</a>

### 💽 Obtener el Código Fuente de Monet

Han pasado cuatro años desde que cree Monet como un proyecto simple para entender cómo crear una pequeña app para ManyChat. El código fuente es principalmente un archivo de configuración json.

<a href="https://github.com/jebucaro/monet-for-manychat" target="_blank" rel="nofollow">Ir a GitHub ➡</a>

---

<span id="terminos-y-condiciones"></span>

## 📜 Términos y Condiciones

La «Monet App» se provee tal cual y según disponibilidad, sin garantías ni representaciones de ningún tipo, expresas ni implícitas. Como usuario, eres el único responsable del uso de la API Key de ManyChat, de las operaciones que realices con ella y de dónde la utilices. Estás consciente de los límites y restricciones del uso de la API de ManyChat y de la disponibilidad de sus servicios. También entiendes que ManyChat detendrá tus automatizaciones si ocurre un error HTTP.

JONATHAN BÚCARO NO SERÁ RESPONSABLE ANTE TI NI ANTE TERCEROS POR DAÑOS DIRECTOS, INDIRECTOS, CONSECUENTES, EJEMPLARES, INCIDENTALES, ESPECIALES O PUNITIVOS, INCLUYENDO PÉRDIDAS DE GANANCIAS, INGRESOS O DATOS QUE SURJAN DEL USO DE ESTE SITIO, INCLUSO SI SE ADVIERTE DE LA POSIBILIDAD DE TALES DAÑOS.

---

<span id="politica-de-privacidad"></span>

## 👓 Política de Privacidad

La «Monet App» no recopila datos. Es un puente o interfaz para que tus ManyChat Flows consuman la API de ManyChat.

---

<span id="configuracion-inicial"></span>

## 🛠️ Configuración Inicial

Ve a `ManyChat Settings > Extensions > API`. Si no has generado una API Key, haz clic en el botón `Generate Your API Key` (1) y copia el contenido del campo Get API Key (2). Si ya tienes una API Key generada, solo cópiala del campo `Get API Key` (2).

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-setup-api-1.webp" alt="Pantalla de configuración ManyChat mostrando la opción para generar una clave API." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-setup-api-generate-1.webp" alt="Vista detallada de configuración ManyChat destacando el cuadro de texto para la clave API y el botón para generarla." loading="lazy">
  </div>
  <em>ManyChat – Genera tu API Key</em>
</div>

Ahora ve a `ManyChat Settings > Extensions > Apps` y selecciona la `App Monet`. Pega tu API Key en el campo `ManyChat API Key` (3). Haz clic en `Save` (4). ¡Y listo!

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-setup-app-select-1.webp" alt="Pantalla de configuración ManyChat mostrando lista de apps instaladas, destacando la aplicación Monet." loading="lazy">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-setup-app-api-1.webp" alt="Vista enfocada de la configuración de la app Monet mostrando el cuadro para pegar la API Key de ManyChat y el botón para guardar." loading="lazy">
  </div>
  <em>Monet – Configura tu API Key de ManyChat</em>
</div>

<span id="acciones"></span>

## ⚡ Acciones

<span id="obten-la-foto-de-perfil"></span>

### 🙂 Obtén la Foto de Perfil

- El tamaño de la foto varía según el canal:
    - Facebook: 200×200 px
    - Instagram: 200×200 px
    - Telegram: 640×640 px
- ManyChat controla cuándo se obtiene la foto, cuándo se actualiza y en qué canales está disponible.

#### Campos de Salida

<div class="table-container">
  <table>
    <tr><th>Campo</th><th>Description</th></tr>
    <tr><td>Profile Picture</td><td>La URL de la foto de perfil estará en este campo. Guarda esta URL en el campo personalizado (CUF) del usuario que elijas.</td></tr>
  </table>
</div>

#### ⚠️ Consejo

Es más seguro validar si el CUF tiene algún valor. Si no, las causas más comunes son:

- Ocurrió un error al consumir la API de ManyChat
- El atributo de la foto de perfil no está disponible en el canal que usas

Aquí tienes un pequeño flujo básico sobre cómo usar la Monet App.

<div class="gallery-box">
  <div class="gallery">
    <img src="/images/blog/2021/get-contacts-profile-picture-inside-manychat/monet-flow-sample.webp" alt="Diagrama de flujo ManyChat que incorpora la app Monet, ilustrando la secuencia de acciones." loading="lazy">
  </div>
  <em>Monet – Ejemplo de Flujo</em>
</div>

---

El sitio oficial de ManyChat.com se encuentra en <a href
="https://manychat.com" target="_blank" rel="nofollow">https://manychat.com/ ➡</a>

Usé la definición de Urban Dictionary de Monet como inspiración para nombrar la app 😆

> Como las pinturas de Monet... Se ven bien de lejos – pero lejos de estar bien de cerca
>
> <a href="https://www.urbandictionary.com/define.php?term=Monet" target="_blank" rel="nofollow">Urban Dictionary ➡</a>

Las pinturas de Claude Monet están en Dominio Público.
