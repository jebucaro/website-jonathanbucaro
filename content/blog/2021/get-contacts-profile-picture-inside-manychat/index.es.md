---
title: 'Obtener la foto de perfil del contacto en ManyChat'
slug: 'get-contacts-profile-picture-inside-manychat'
date: 2021-12-08T17:09:10-06:00
image: 'images/cover.png'
tags: [manychat]
draft: false
description: 'Obtén la foto de perfil de tus contactos en ManyChat. Una acción simple, sin el rollo técnico de una solicitud externa'
---

## 📖 Tabla de contenidos

- [👋 Saludos](#greetings)
- [📜 Términos y condiciones](#terms-and-conditions)
- [👓 Política de privacidad](#privacy-policy)
- [🛠️ Configuración inicial](#initial-setup)
- [⚡ Acciones](#actions) - [🙂 Obtener foto de perfil](#get-profile-picture)

---

<span id="greetings"></span>

## 👋 Saludos

¡Hola y bienvenido! Gracias por tu interés en Monet.

Esta app usa la API de ManyChat para obtener la URL de la foto de perfil de tus contactos. Vas a necesitar una cuenta ManyChat Pro y, como estás consumiendo la API de ManyChat directamente, debes tener en cuenta los {{< extlink href="https://support.manychat.com/support/solutions/articles/36000070776-manychat-api#Is-there-any-limit-to-a-number-of-API-calls%3F" >}}límites de la API de ManyChat{{< /extlink >}}. La API que usa mi app Monet es `fb/subscriber/getInfo`, con un límite de 10 RPS (requests per second).

El límite de uso de la API está bien para la mayoría de casos, solo ten cuidado si haces algo a lo grande 😉

{{< gallery caption="Galería Monet" >}}
{{< gallery-image src="images/0-monet-description.webp" alt="Arte de Monet acompañado de texto: 'One simple action without the technical fuzz of an external request' relacionado con una aplicación de ManyChat." >}}
{{< gallery-image src="images/1-monet-setup.webp" alt="Arte de fondo de Monet con una laptop mostrando la pantalla de configuración de la app de ManyChat para ingresar la API key." >}}
{{< gallery-image src="images/2-monet-actions.webp" alt="Arte de fondo de Monet con una laptop mostrando las acciones disponibles en la app de ManyChat." >}}
{{< gallery-image src="images/3-monet-expanded-actions.webp" alt="Arte de fondo de Monet con una laptop mostrando la configuración para obtener la URL de la foto de perfil del usuario en la app de ManyChat." >}}
{{< gallery-image src="images/4-monet-flow.webp" alt="Arte de fondo de Monet con una laptop mostrando un flow de ManyChat con la acción para obtener la URL de la foto de perfil del usuario." >}}
{{< gallery-image src="images/5-monet-phone.webp" alt="Arte de fondo de Monet con un teléfono mostrando la app de Messenger con la foto de perfil del usuario en una conversación con un chatbot." >}}
{{< /gallery >}}

### 🌐 Instalar Monet para ManyChat

El siguiente link te va a llevar a la página de instalación de la app en ManyChat. El único permiso necesario es `View contact data`, para poder leer el dato de la foto de perfil del contacto.

{{< extlink href="https://manychat.com/apps/849/install" >}}Instalar Monet{{< /extlink >}}

### 💽 Obtener el código fuente de Monet

Han pasado cuatro años desde que creé Monet como un proyecto sencillo para entender cómo crear una app pequeña para ManyChat. El código fuente es principalmente un archivo de configuración en JSON.

{{< extlink href="https://github.com/jebucaro/monet-for-manychat" >}}Ir a GitHub{{< /extlink >}}

---

<span id="terms-and-conditions"></span>

## 📜 Términos y condiciones

La «Monet App» se proporciona «tal cual» y «según disponibilidad», sin garantías o declaraciones de ningún tipo, ya sean expresas o implícitas. Tú, como usuario, eres el único responsable del uso de la API Key de ManyChat, de las operaciones que haces con ella y de dónde la utilizas. Reconoces los límites y restricciones de usar la API de ManyChat y la disponibilidad de sus servicios. También entiendes que ManyChat detendrá tus automatizaciones si ocurre un error HTTP.

EN NINGÚN CASO JONATHAN BÚCARO SERÁ RESPONSABLE ANTE TI O ANTE TERCEROS POR DAÑOS DIRECTOS, INDIRECTOS, CONSECUENTES, EJEMPLARES, INCIDENTALES, ESPECIALES O PUNITIVOS, INCLUYENDO PÉRDIDA DE GANANCIAS, PÉRDIDA DE INGRESOS, PÉRDIDA DE DATOS U OTROS DAÑOS DERIVADOS DEL USO DEL SITIO, INCLUSO SI SE HA ADVERTIDO DE LA POSIBILIDAD DE DICHOS DAÑOS.

---

<span id="privacy-policy"></span>

## 👓 Política de privacidad

La «Monet App» no rastrea datos. Es un puente o una interfaz para que tus flows de ManyChat consuman la API de ManyChat.

---

<span id="initial-setup"></span>

## 🛠️ Configuración inicial

Ve a **ManyChat Settings > Extensions > API**. Si no has generado una API Key, haz clic en el botón **Generate Your API Key** (1) y copia el contenido del campo **Get API Key** (2). Si ya generaste tu API Key previamente, solo cópiala desde el campo **Get API Key** (2).

{{< gallery caption="ManyChat - Genera tu API Key" >}}
{{< gallery-image src="images/monet-setup-api-1.webp" alt="Pantalla de configuración de ManyChat mostrando la opción para generar una API key." >}}
{{< gallery-image src="images/monet-setup-api-generate-1.webp" alt="Detalle de la configuración de ManyChat resaltando el campo de texto de la API key y el botón para generarla." >}}
{{< /gallery >}}

Ahora ve a **ManyChat Settings > Extensions > Apps** y selecciona la app **Monet**. Pega tu API Key en el campo **ManyChat API Key** (3). Haz clic en **Save** (4). ¡Y listo!

{{< gallery caption="Monet - Configura tu API Key de ManyChat" >}}
{{< gallery-image src="images/monet-setup-app-select-1.webp" alt="Pantalla de configuración de ManyChat mostrando la lista de apps instaladas, resaltando la app Monet." >}}
{{< gallery-image src="images/monet-setup-app-api-1.webp" alt="Vista enfocada de la configuración de la app Monet mostrando el campo para pegar la API key de ManyChat y el botón para guardar." >}}
{{< /gallery >}}

<span id="actions"></span>

## ⚡ Acciones

<span id="get-profile-picture"></span>

### 🙂 Obtener foto de perfil

- El tamaño de la foto varía según el canal - Facebook: 200×200 px - Instagram: 200×200 px - Telegram: 640×640 px
- ManyChat controla cuándo se obtiene la foto, cuándo se actualiza y en qué canales está disponible.

#### Campos de salida

<div class="table-container">
    <table>
        <tr><th>Campo</th><th>Descripción</th></tr>
        <tr><td>Foto de perfil</td><td>La URL de la foto de perfil estará en este campo. Guárdala en el campo personalizado (CUF) que prefieras.</td></tr>
    </table>
</div>

#### ⚠️ Tip

Es más seguro validar si el CUF tiene algún valor. Si no, estas suelen ser las causas más comunes:

- Ocurrió un error al consumir la API de ManyChat
- El atributo de foto de perfil no está disponible en el canal que estás usando

Aquí tienes un flow básico de ejemplo para usar la app Monet.

{{< gallery caption="Monet - Flow de ejemplo" >}}
{{< gallery-image src="images/monet-flow-sample.webp" alt="Diagrama de un flow de ManyChat incorporando la app Monet, ilustrando la secuencia de acciones." >}}
{{< /gallery >}}

---

El sitio oficial de ManyChat.com se encuentra en {{< extlink href="https://manychat.com" >}}ManyChat{{< /extlink >}}

Usé la definición de Monet de Urban Dictionary como inspiración para nombrar la app 😆

> Como las pinturas de Monet... Se ven bien de lejos, pero de cerca están lejos de verse bien
>
> {{< extlink href="https://www.urbandictionary.com/define.php?term=Monet" >}}Urban Dictionary{{< /extlink >}}

Las pinturas de Claude Monet están disponibles en dominio público.
