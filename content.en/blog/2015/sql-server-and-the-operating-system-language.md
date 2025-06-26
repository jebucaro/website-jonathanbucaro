---
translationKey: '2015-sql-server-and-the-operating-system-language'
title: 'SQL Server does not support the language of the OS'
date: 2015-02-22T20:34:55-06:00
image: '/images/blog/2015/sql-server-and-the-operating-system-language/cover.webp'
tags: [mssql]
draft: false
description: "Solventa fácilmente el error 'SQL Server does not support the language of the OS'."
---

Mi equipo tiene instalado Windows 8.1 con idioma Español Guatemala, al intentar instalar Microsoft SQL Server aparece el siguiente mensaje en pantalla.

> This SQL Server setup media does not support the language of the OS, or does not have the SQL Server English-language version installation files…

El error por la descripción del mensaje, parece ocurrir para cualquiera que tenga su sistema operativo en idioma español y que este no sea Español España.

Para solventar el error debes dirigirte al Panel de Control y en la categoría **Reloj, Idioma y región**, selecciona la opción **Cambiar formatos de fecha, hora o número**.

En la ventana de **Región**, pestaña **Formatos**. Selecciona del combo **Formato** la opción **Español (España)**.

Al ejecutar el instalador de SQL Server no se generará error de que el idioma del instalador no es compatible con el sistema operativo.

Una vez terminada la instalación, puedes regresar la configuración del formato que se tenía configurada anteriormente.

## ✨ Actualización

En Windows 10 cambia la categoría en el Panel de Control. Dirigete a la categoría **Reloj y región**, selecciona la opción **Cambiar formatos de fecha, hora o número**. Los demás pasos continuan iguales.

---

Foto de <a href="https://unsplash.com/@tompodmore86?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Tom Podmore</a> en <a href="https://unsplash.com/es/fotos/3mEK924ZuTs?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
