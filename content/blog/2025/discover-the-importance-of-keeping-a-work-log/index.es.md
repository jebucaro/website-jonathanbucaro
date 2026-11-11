---
title: 'Descubre la importancia de llevar un registro de trabajo'
date: 2025-02-04T17:07:47-06:00
image: 'images/cover.png'
tags: [productivity]
draft: false
description: 'Descubre cómo llevar un registro de trabajo puede ayudarte a mantenerte organizado, aumentar tu productividad y destacar en tu equipo.'
slug: 'discover-the-importance-of-keeping-a-work-log'
---

Empecé a llevar un registro de trabajo cuando era desarrollador en Banco G&T Continental, y cuando empecé a trabajar como contratista se volvió algo de todos los días. Suena a una tarea más, pero me ha salvado más de una vez:

1. En una reestructuración de la empresa, cuando me pidieron un reporte detallado de mis logros, los obstáculos que tuve y cómo los resolví.
2. Cuando pedí un aumento, tenía toda la información lista para presentar mi caso.
3. En un contrato de tiempo y materiales, el cliente pidió el detalle de las actividades de cada día en la hoja de tiempo, y con mi registro lo entregué rápido y sin errores.

En los tres casos, la otra opción era ponerme a escarbar en la memoria para acordarme de qué hice hace semanas.

## Qué apunto

Nada complicado. Durante el día voy anotando:

- Lo que terminé
- Lo que sigue
- Lo que me atrasó o me quitó tiempo
- Notas, cosas que aprendí y lo que se me complicó

Se parece un poco a las preguntas del stand-up, pero es para ti, no para el equipo. Normalmente apunto mis objetivos al empezar el día, el avance y las sorpresas (esos requerimientos de último momento) durante el día, y un resumen corto al final.

Con el tiempo eso te da varias cosas. Tienes un historial de tus logros para las evaluaciones, sin depender de la memoria. Ves en qué se fueron realmente las horas, interrupciones incluidas, y a qué hora trabajas mejor. La nota de la mañana te resuelve el "¿por dónde empiezo?", y al final del día ves qué quedó listo y pasas lo demás para mañana sin andarlo cargando en la cabeza. Prefiero buscar las cosas en mis notas que tratar de acordarme.

Usa lo que sea rápido de actualizar y fácil de buscar: un cuaderno, Notion, lo que sea. Yo uso Obsidian todos los días, así que abajo está mi configuración.

## Mi configuración en Obsidian

`Obsidian` es una app de escritura gratuita y privada, y la puedes usar para lo que sea, incluso para trabajo comercial. Mi plantilla es una versión simplificada de la que comparte **Dann Berg** en {{< extlink href="https://dannb.org/blog/2022/obsidian-daily-note-template/" >}}My Obsidian Daily Note Template{{< /extlink >}}, adaptada para un registro de trabajo.

### Crea un vault

Instala `Obsidian` y crea un vault para tu registro de trabajo.

{{< gallery caption="Obsidian - Obsidian - Crear un vault" >}}
{{< gallery-image src="images/obsidian.webp" alt="Pantalla de bienvenida de Obsidian mostrando diferentes opciones, resaltando la opción para crear un vault nuevo." >}}
{{< gallery-image src="images/obsidian-create-vault.webp" alt="Opciones dentro de 'Create a new vault' en Obsidian, donde se define el nombre y la ubicación del vault." >}}
{{< /gallery >}}

### Instala los plugins

Necesitas dos plugins:

- {{< extlink href="https://help.obsidian.md/Plugins/Daily+notes" >}}Daily Notes{{< /extlink >}}, incluido por defecto en Obsidian, no requiere instalación.
- {{< extlink href="https://github.com/liamcain/obsidian-calendar-plugin" >}}Calendar{{< /extlink >}}, un plugin de la comunidad que se instala desde la {{< extlink href="https://help.obsidian.md/Extending+Obsidian/Community+plugins" >}}galería de plugins de Obsidian{{< /extlink >}}

Primero habilita los plugins de la comunidad:

{{< gallery caption="Obsidian - Habilitar plugins de la comunidad" >}}
{{< gallery-image src="images/obsidian-enable-community-plugins.webp" alt="Pantalla de configuración en la sección de community plugins de Obsidian, con el botón para habilitar los plugins de la comunidad." >}}
{{< gallery-image src="images/obsidian-community-plugins-enabled.webp" alt="Opción para habilitar los plugins de la comunidad en Obsidian, mostrando estado activo." >}}
{{< /gallery >}}

Después dale clic a `Browse` y busca el plugin por nombre (en la captura sale `Templater`, pero funciona igual para cualquier plugin):

{{< gallery caption="Obsidian - Buscar plugins de la comunidad" >}}
{{< gallery-image src="images/obsidian-community-plugins-browse.webp" alt="Búsqueda de plugins en la ventana de community plugins en Obsidian, mostrando la búsqueda de 'Templater'." >}}
{{< /gallery >}}

Instala y habilita Calendar:

{{< gallery caption="Obsidian - Instalar y habilitar el plugin Calendar" >}}
{{< gallery-image src="images/obsidian-community-plugins-install-calendar.webp" alt="Resultado de búsqueda del plugin 'Calendar' en Obsidian, mostrando el botón de instalación." >}}
{{< gallery-image src="images/obsidian-community-plugins-calendar-enable.webp" alt="Plugin 'Calendar' instalado y mostrando el botón para habilitar." >}}
{{< gallery-image src="images/obsidian-community-plugins-calendar-enabled.webp" alt="Plugin 'Calendar' en Obsidian ya instalado y habilitado." >}}
{{< /gallery >}}

### Crea la plantilla

Crea una carpeta `templates` en la raíz del vault, y adentro una nota llamada `daily-notes-template`. Pega esto en modo source (`Ctrl+Shift+v` pega como texto plano):

```markdown
---
created: '{{date:YYYY-MM-DD-dddd}}'
tags:
    - daily
---

## 🗓️ Daily Questions

### 📌 Tasks

- [ ]

### 🎥 Meetings

-

### 🚧 Impediments

-

## 📝 Notes
```

Luego crea una carpeta `daily` en la raíz del vault.

{{< gallery caption="Obsidian - Estructura de directorios" >}}
{{< gallery-image src="images/obsidian-folder-structure.webp" alt="Pantalla principal de Obsidian mostrando la estructura de carpetas para configurar el template y la carpeta de generación de notas diarias." >}}
{{< gallery-image src="images/obsidian-template-content.webp" alt="Contenido del template de notas diarias en Obsidian." >}}
{{< /gallery >}}

### Configura Daily Notes

En Settings, dentro de **Core plugins**, abre **Daily Notes** y configura:

- **Date Format**: `YYYY/MM-MMMM/YYYY-MM-DD-dddd`, que ordena tus notas por _año > mes > día_
- **New File Location**: `daily`
- **Template file location**: `templates/daily-notes-template`

Yo también activo **Open daily note on startup**.

{{< gallery caption="Obsidian - Configuración de Daily Note" >}}
{{< gallery-image src="images/obsidian-create-daily-note-configuration.webp" alt="Configuración del plugin Daily Notes en Obsidian, mostrando ajustes para el formato de fecha, la ubicación del archivo y la opción de crear la nota diaria al iniciar." >}}
{{< /gallery >}}

### Úsala

Dale clic a `Open today's daily note` en la barra lateral izquierda para crear la nota de hoy, o abrirla si ya existe. Si activaste la opción de inicio, Obsidian lo hace solo al abrirse.

{{< gallery caption="Obsidian - Crear la nota de hoy" >}}
{{< gallery-image src="images/obsidian-open-todays-daily-note.webp" alt="Pantalla de la app Obsidian, mostrando dónde hacer clic para tu nota diaria." >}}
{{< gallery-image src="images/obsidian-todays-daily-note.webp" alt="Una nota diaria creada en Obsidian usando la plantilla configurada." >}}
{{< /gallery >}}

El botón **Expand** de arriba a la derecha muestra la pestaña **Calendar**, donde puedes saltar entre días. Si le das doble clic a una fecha sin nota, te ofrece crearla. Cuando está abierta, el botón cambia a **Collapse**.

{{< gallery caption="Obsidian - Vista de Calendar" >}}
{{< gallery-image src="images/obsidian-expand.webp" alt="App Obsidian mostrando dónde hacer clic para expandir vistas, como la vista de calendario." >}}
{{< gallery-image src="images/obsidian-expand-calendar.webp" alt="App Obsidian mostrando la vista de Calendar." >}}
{{< /gallery >}}

Yo me paso a modo de edición cuando necesito revisar algo desde esa vista. Con la búsqueda normalmente encuentras lo que necesitas, pero cuando ya tengas unas semanas de notas, dale una mirada al `Graph view`.

---

Foto por {{< extlink href="https://unsplash.com/@dsebas?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Pedro Costa{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/black-and-white-computer-keyboard-aXY5doQNZTc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}
