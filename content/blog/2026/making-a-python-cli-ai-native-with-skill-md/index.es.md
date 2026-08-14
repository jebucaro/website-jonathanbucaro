---
title: 'Cómo hacer que una CLI de Python sea nativa para IA con SKILL.md'
slug: 'making-a-python-cli-ai-native-with-skill-md'
date: 2026-03-23T17:15:45+00:00
lastmod: 2026-08-13T00:00:00Z
description: 'Aprende cómo hacer que una CLI de Python sea nativa para IA agregando un archivo SKILL.md para Claude Code, con pokecli como ejemplo práctico inspirado en el patrón de Playwright CLI.'
draft: false
tags: [python, ai-tools, claude]
image: 'images/cover.png'
---

## 🎯 TL;DR

Este post muestra cómo hacer que un CLI de Python sea más fácil de usar para **Claude Code**. Uso una herramienta nueva llamada `pokecli` como ejemplo y le agrego un `SKILL.md` pequeño que le da al agente una guía clara de comandos.

La meta no es cambiar cómo funciona el CLI. La idea es evitar que el agente tenga que volver a aprender el mismo texto de ayuda durante la tarea. Un buen skill le da a Claude Code un camino más corto hacia la herramienta, con disparadores claros, grupos de comandos, ejemplos y un archivo de referencia pequeño cuando hace falta más detalle.

**Elige tu camino:**

- 🚀 [Construye el skill](#quick-start)
- 👀 [Mira el archivo final `SKILL.md`](#results)
- 🧠 [Aprende la receta](#how-it-works)
- ✅ [Prueba el skill](#testing-your-skill)
- 🛠️ [Crea uno tú mismo](#build-it-yourself)

---

## 🤔 ¿Por qué la construí esto?

Hace poco di una charla técnica interna en el trabajo llamada **_Make Your CLI Tools AI-Native with SKILL.md_**. Obtuve una buena señal de que la idea conectó, pero también dejó algo claro: necesitaba un ejemplo práctico que la gente pudiera revisar y reutilizar.

Este post es ese ejemplo.

Me gustan los CLI que hacen una cosa bien, y `pokecli` es un buen ejemplo de eso. Tiene una lista de comandos limpia, una salida clara y un flujo que se siente natural en la terminal.

{{< gallery caption="pokecli ejecutando el commando help" >}}
{{< gallery-image src="images/pokecli-help.webp" alt="Windows Terminal mostrando el resultado de ejecutar el comando help de pokecli" >}}
{{< /gallery >}}

{{< gallery caption="pokecli ejecutando los comandos pokemon y move" >}}
{{< gallery-image src="images/pokecli-pokemon.webp" alt="Windows Terminal mostrando el resultado de ejecutar el comando pokemon de pokecli para buscar los datos de Charizard" >}}
{{< gallery-image src="images/pokecli-move.webp" alt="Windows Terminal mostrando el resultado de ejecutar el comando move de pokecli para buscar los datos de Flamethrower and Thunderbolt" >}}
{{< /gallery >}}

Lo que quería mostrar es que no necesitas rediseñar un CLI para hacerlo más útil para un agente de IA. En muchos casos, la pieza que falta es una guía compacta que le diga al agente cuándo usar la herramienta, qué comandos existen y cómo aplicarlos de forma segura.

---

## 📸 Míralo en Acción

Después de instalar pokecli y sus skills, el resultado final es una carpeta pequeña de skill que Claude Code puede cargar cuando una petición o prompt coincide con los disparadores correctos:

```text
pokecli-skill/
└── skills/
    └── pokecli/
        ├── SKILL.md
        └── references/
            ├── api-fields.md
            └── workflows.md
```

Una vez instalado en `~/.claude/skills/pokecli`, Claude Code entiende mucho mejor cómo usar la herramienta:

- Cuándo conviene usar `pokecli`
- Qué comandos pertenecen a cada recurso
- Qué flags comparten los comandos `get`
- Cómo descargar sprites
- Cómo revisar y limpiar la caché local

{{< gallery caption="" >}}
{{< gallery-video src="images/pokecli-skill-in-action-claude-code.webm" alt="Claude Code usando SKILL.md para interactuar con pokecli." >}}
{{< /gallery >}}

Esta es la misma idea base que usa el skill de Microsoft para {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}}: mantener pequeño el disparador que siempre está cargado, dejar el cuerpo principal enfocado y mover el detalle extra a archivos de referencia solo cuando haga falta.

---

## 💡 El Problema (En 60 Segundos)

El texto de ayuda de un CLI es excelente para humanos. El problema no es que un agente no pueda usarlo. El problema es que el agente tiene que volver a aprender la misma superficie de comandos durante la tarea.

Si un agente solo ve la salida de ayuda, todavía tiene que resolver preguntas básicas durante el trabajo:

- ¿Qué grupos de recursos existen?
- ¿Qué comandos soportan `--no-cache`?
- ¿Qué formatos de salida hay disponibles?
- ¿Cómo funcionan las descargas de imágenes?
- ¿Qué comandos del caché es seguro ejecutar?

Eso significa que el modelo gasta parte de su contexto volviendo a aprender la herramienta en vez de resolver la petición del usuario.

Ese es el valor real de un skill. Convierte un CLI en una interfaz más pequeña y más directa para un agente.

---

## ✨ La Solución

Un skill es una carpeta de instrucciones en Markdown que le enseña a un agente de IA cómo usar una herramienta o seguir un flujo de trabajo.

En Claude Code, un skill bien hecho normalmente tiene tres capas:

1. **Frontmatter**: el nombre del skill, la descripción y las herramientas permitidas
2. **Cuerpo de `SKILL.md`**: la guía de comandos que el agente lee cuando se activa el skill
3. **Referencias**: documentación extra que solo se carga cuando el archivo principal no basta

Este patrón importa porque mantiene pequeño el contexto por defecto.

El frontmatter se encarga de activar el skill. El cuerpo le da al agente un mapa corto y práctico de comandos. Las referencias guardan el detalle a nivel de campos que solo importa en algunos casos.

Este es el patrón que quiero aplicar a pokecli.

---

<span id="quick-start"></span>

## 🚀 Inicio Rápido

### Instala el CLI con `uv`

{{< callout important>}}

Es requisito tener instalado `uv` antes de continuar. Para instalar `uv`, puedes seguir {{< extlink href="https://docs.astral.sh/uv/getting-started/installation/" >}}la guía de instalación en el sitio de Astral{{< /extlink >}}.

{{< /callout >}}

```bash
uv tool install git+https://github.com/jebucaro/pokecli
```

Después puedes desinstalar la herramienta con este comando.

```bash
uv tool uninstall pokecli
```

### Instala el skill de Claude

```bash
pokecli install --skills
```

{{< gallery caption="Instalación de pokecli y SKILL.md" >}}
{{< gallery-image src="images/uv-install-pokecli.webp" alt="Instalación de pokecli usando el gestor de paquetes uv." >}}
{{< gallery-image src="images/pokecli-install-skills.webp" alt="Instalación de los skills de pokecli usando el comando install." >}}
{{< /gallery >}}

También puedes copiar los archivos del skill manualmente o hacer ese paso con un script pequeño. Agregué el comando `install --skills` para que el ejemplo estuviera completo y fuera fácil de ejecutar.

### Opcional: entorno local de desarrollo

```bash
git clone https://github.com/jebucaro/pokecli
cd pokecli
uv sync
uv run pokecli --help
```

pokecli sigue teniendo grupos de comandos de primer nivel fáciles de reconocer, como `pokemon`, `berry`, `item`, `move`, `location`, `game`, `image` y `cache`, pero el repositorio actual ahora agrupa muchos recursos de nivel más bajo dentro de esas familias en vez de exponerlos todos como comandos planos de primer nivel. En la práctica, para el skill lo importante no es el número exacto de grupos de primer nivel, sino que la mayoría de los recursos soportan `get <name_or_id>` y `list`, mientras que Pokemon agrega comandos extra de navegación como `moves`, `species`, `evolution`, `encounters` y `forms`.

### Prueba el CLI antes de escribir el skill

Agrega `uv run` antes de cada comando si estás probando localmente con el entorno de desarrollo.

```bash
pokecli pokemon get pikachu
pokecli berry list --limit 5
pokecli pokemon image 25 -o /tmp/pikachu.png
pokecli cache stats
```

{{< callout note >}}
El skill no reemplaza la documentación de la CLI. El skill le da a Claude Code un punto de entrada más pequeño y más útil hacia la misma lista de comandos.
{{< /callout >}}

---

<span id="results"></span>

## 📦 Resultados

El `SKILL.md` actual en el repositorio tiene cerca de 180 líneas, organizado igual que describí arriba: frontmatter, un "Agent rule" corto, un quick start, un árbol de decisión y una sección de comandos. En vez de pegar el archivo completo aquí, estas son las tres partes que vale la pena leer con cuidado.

### Frontmatter y la regla para el agente

```yaml
---
name: pokecli
description: Queries Pokemon, moves, items, abilities, types, locations, game data, forms, machines, encounters, evolutions, and other PokeAPI-backed resources via the pokecli CLI. Use when the user needs Pokemon stats, move info, type matchups, catch locations, evolution chains, sprite downloads, regional or generation data, or cache management. Also use when the user mentions pokecli, pokedex, or PokeAPI.
allowed-tools: Bash(pokecli:*)
user-invocable: false
---
## Agent rule

Use the canonical command path shown in this skill. Human aliases exist, but agents should prefer explicit commands like `pokemon get`, `move get`, and `game region get`.

If a memorized command fails, check `pokecli --help` or the subgroup help before guessing.
```

Agregué esta regla después de que `pokecli` sumó una capa de comandos más corta y pensada para humanos (más abajo hablo de eso). Cuando un CLI ofrece dos formas válidas de pedir lo mismo, el skill necesita decir cuál debería preferir el agente por defecto, porque la forma más corta no siempre es la más segura para un script.

### Un fragmento del árbol de decisión

La tabla completa tiene cerca de treinta filas, una por cada recurso que cubre el CLI. Un fragmento de ella:

| Intención del usuario                           | Comando                                   |
| ----------------------------------------------- | ----------------------------------------- |
| Estadísticas, tipos y habilidades de un Pokémon | `pokecli pokemon get <name>`              |
| ¿Puede este Pokémon aprender el movimiento X?   | `pokecli pokemon can-learn <name> <move>` |
| Cadena de evolución completa de un Pokémon      | `pokecli pokemon evolution <name>`        |
| Efectividad de tipos                            | `pokecli type get <name>`                 |
| Buscar una MT o MO                              | `pokecli game machine get <id>`           |

Todo lo que no aparece en la tabla cae en el contrato uniforme `get <name_or_id>`, así que la tabla solo necesita señalar las intenciones que mapean a algo menos obvio.

### Alias para humanos

```bash
pokecli pokemon pikachu
pokecli move thunderbolt
pokecli pokemon where pikachu
pokecli pokemon evo eevee
```

Estas son las formas más cortas, pensadas para escribirse a mano. El skill las lista aparte del árbol de decisión para que el agente las reconozca en el mensaje de un usuario en vez de tratarlas como sintaxis no soportada.

Y esta es la estructura de carpetas que Claude Code debería terminar cargando:

```text
.claude/
└── skills/
    └── pokecli/
        ├── SKILL.md
        └── references/
            ├── api-fields.md
            └── workflows.md
```

---

<span id="how-it-works"></span>

## 🏗️ ¿Cómo Funciona?

Lo bueno de este patrón es que se mantiene cerca de la herramienta misma. No estás inventando una interfaz nueva. Estás reorganizando el CLI como una guía amigable para un agente.

### 1. El flujo de instalación

Para este ejemplo, la configuración funciona como una instalación normal de herramienta.

Instalas `pokecli` con `uv tool install git+https://github.com/jebucaro/pokecli`, y después ejecutas `pokecli install --skills`.

También podrías instalar los archivos del skill manualmente o con un script pequeño. Agregué este comando para que el post pudiera mostrar un ejemplo completo de principio a fin.

En ese punto, el CLI no genera un skill nuevo desde cero. Copia los archivos del skill que ya vienen dentro del paquete instalado hacia el lugar donde Claude Code espera encontrarlos.

Eso importa porque el usuario no necesita tener el repo clonado de forma local. La herramienta instalada ya trae lo que necesita. En la práctica, el flujo es simple:

1. `uv` instala el CLI como una herramienta ejecutable
2. `pokecli install --skills` entra al grupo de comandos `install`
3. El comando lee los archivos del skill empaquetados
4. Crea `~/.claude/skills/pokecli`
5. Escribe `SKILL.md`, `references/api-fields.md` y `references/workflows.md`

Esto mantiene corta la configuración y hace que la implementación sea fácil de explicar.

### 2. YAML Frontmatter: la capa de disparo

El frontmatter es la parte que Claude lee todo el tiempo.

Para pokecli, tiene que responder dos preguntas rápido:

1. ¿Qué hace este skill?
2. ¿Cuándo debería cargarlo Claude?

Por eso la descripción necesita tanto el propósito de la herramienta como las frases de disparo que un usuario de verdad podría decir, como `pokedex`, `Pokemon stats`, `PokeAPI` o `download sprites`.

El `name` debería coincidir con el nombre de la carpeta, la entrada `allowed-tools` debería mantener el alcance del skill limitado a comandos de `pokecli`, y `user-invocable: false` lo deja como un skill de fondo en vez de un comando expuesto al usuario.

### 3. `allowed-tools`: la capa de seguridad

Esta línea importa más de lo que parece:

```yaml
allowed-tools: Bash(pokecli:*)
```

Le dice a Claude Code que este skill puede ejecutar comandos de `pokecli`, pero no comandos arbitrarios de shell. Ese es un buen valor por defecto para un skill enfocado en tareas.

En otras palabras, el skill no es solo una capa de comodidad. También es un límite.

### 4. El cuerpo: la guía de comandos de trabajo

El cuerpo debería leerse como una guía rápida para un agente.

Eso significa:

- secciones cortas
- grupos de comandos que reflejen el CLI
- ejemplos que se puedan copiar y ejecutar
- nada de teoría larga en medio de la lista de comandos

pokecli ya nos da una estructura limpia de primer nivel para reflejar:

- `pokemon`
- `berry`
- `item`
- `move`
- `location`
- `game`
- `image`
- `cache`

Dentro de esos grupos, el skill puede mostrar las operaciones que más importan, como `get`, `list`, `moves`, `download`, `stats` y `clear`, mientras que recursos anidados como `pokemon form`, `move damage-class`, `location area` y `game region` quedan cerca de sus familias principales.

### 5. Referencias: dónde va el detalle extra

No toda pregunta debería vivir en el `SKILL.md` principal.

Por ejemplo:

- ¿Qué significa `base_experience` para un Pokémon?
- ¿Qué es berry firmness?
- ¿Qué campos son más útiles para comparar movimientos?
- ¿Qué variantes de sprite suelen estar disponibles?

Ese tipo de detalle va en `references/api-fields.md`. Las recetas de varios pasos van en `references/workflows.md`. El skill principal se mantiene corto y los archivos más profundos están ahí cuando Claude los necesita.

Esto hace que el skill sea más fácil de mantener y más fácil de activar.

### 6. Alias para humanos: una sola clase, sin comandos duplicados

A mitad de este proyecto, pokecli sumó una segunda forma, más corta, de escribir los mismos comandos: `pokecli pokemon pikachu` en vez de `pokecli pokemon get pikachu`. Eso no es un árbol de comandos duplicado. Es una sola subclase pequeña de `TyperGroup` que reescribe el primer argumento no reconocido como `get` antes de que Typer lo resuelva:

```python
class ResourceGroup(TyperGroup):
    def resolve_command(self, ctx, args):
        if args:
            first = args[0]
            if not first.startswith("-") and first not in self.commands:
                args = ["get", *args]
        return super().resolve_command(ctx, args)
```

Para el skill, esto importa porque ahora Claude Code tiene dos formas válidas de pedir lo mismo. El `SKILL.md` resuelve eso manteniendo el árbol de decisión con la forma canónica, `pokemon get <name>`, y listando los alias aparte, así el agente tiene un valor por defecto y no tiene que adivinar cuál forma es más segura para usar en un script.

---

## ⚖️ Comparación Lado a Lado

Usé {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}} de Microsoft como patrón de referencia para este skill de pokecli.

La meta no era copiar el flujo de trabajo del navegador. Era reutilizar la misma forma del skill: un disparador pequeño, una guía de comandos enfocada y el detalle extra movido a archivos de referencia. Por eso esta comparación importa.

| Decisión de diseño        | Playwright CLI                                | pokecli                                                                    |
| ------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| Disparador principal      | tareas de automatización del navegador        | tareas de consulta de datos de Pokémon                                     |
| Alcance de la herramienta | `Bash(playwright-cli:*)`                      | `Bash(pokecli:*)`                                                          |
| Forma del quick start     | navegar, hacer clic, escribir, presionar      | obtener y listar datos, revisar movimientos de Pokémon, descargar imágenes |
| Flujo                     | navegar, interactuar, volver a tomar snapshot | consultar, explorar, revisar movimientos, descargar, usar caché            |
| Grupos de comandos        | acciones y sesiones del navegador             | grupos base más comandos agrupados por recurso anidado                     |
| Documentación extra       | referencias separadas del skill               | `references/api-fields.md` y `references/workflows.md`                     |

Los comandos y el caso de uso cambian, pero la estructura sigue igual. Esa es la parte útil del patrón.

---

<span id="testing-your-skill"></span>

## ✅ Prueba Tu Skill

{{< extlink href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en" >}}La guía de Anthropic sobre skills{{< /extlink >}} ayuda bastante aquí: prueba tanto la activación como el comportamiento.

### Consultas que deberían activar el skill

- "Busca las estadísticas de Pikachu"
- "Muéstrame datos de berries desde PokeAPI"
- "Descarga un sprite de Charizard"
- "Compara Thunderbolt y Flamethrower"
- "Usa pokecli para explorar items"

### Consultas que no deberían activar el skill

- "Ayúdame a escribir una clase en Python"
- "¿Cómo está el clima hoy?"
- "Crea una hoja de cálculo"
- "Resume esta transcripción de reunión"

### Comprobaciones funcionales

```bash
pokecli pokemon get pikachu
pokecli pokemon moves pikachu
pokecli pokemon can-learn pikachu thunderbolt
pokecli berry list --limit 5
pokecli item get master-ball --format json
pokecli move get thunderbolt
pokecli pokemon image 25 -o /tmp/pika.png
pokecli cache clear --resource pokemon
pokecli cache stats
```

Si estos comandos funcionan, entonces los ejemplos del skill están bien anclados a la herramienta real.

---

<span id="build-it-yourself"></span>

## 🛠️ Reto: Crea Uno Tú Mismo

Si quieres llevar esto un paso más allá, prueba quitar el skill listo de pokecli y crear el tuyo.

Esta es una buena prueba porque te deja ver qué puede inferir Claude solo a partir del CLI, dónde se traba y qué tipo de guía de verdad ayuda.

### 1. Quita del camino el skill incluido

Si instalaste antes el skill empaquetado, elimínalo primero para que no se cargue (puedes agregarlo nuevamente si lo necesitas utilizando el comando `pokecli install --skills`).

```bash
rm -rf ~/.claude/skills/pokecli
```

### 2. Crea una carpeta pequeña de proyecto

Crea una carpeta limpia para el ejercicio y agrega la ruta local del skill que Claude va a leer.

```bash
mkdir -p pokecli-skill-lab/.claude/skills/pokecli
cd pokecli-skill-lab
```

Dentro de esa carpeta, crea `./.claude/skills/pokecli/SKILL.md`.

### 3. Empieza con un primer borrador pequeño

No intentes escribir el skill perfecto en el primer intento. Empieza con la versión útil más pequeña.

Ya tienes la implementación completa antes en este post, así que úsala como referencia en vez de repetir aquí un segundo borrador completo.

Una primera versión sólida debería incluir:

- frontmatter con `name`, `description` y `allowed-tools`
- algunos comandos de quick start
- grupos de comandos que coincidan con el CLI
- algunos ejemplos que Claude pueda copiar y ejecutar
- archivos de referencia opcionales para detalles más profundos

### 4. Ejecuta Claude dentro de la carpeta del proyecto

Ahora inicia Claude desde dentro de la carpeta para que pueda ver el skill local.

```bash
claude
```

Una vez que Claude esté corriendo, prueba prompts como estos:

- "Usa pokecli para buscar las estadísticas de Pikachu"
- "Explora berries con pokecli y muéstrame cinco"
- "Descarga un sprite de Charizard con pokecli"
- "Compara Thunderbolt y Flamethrower con pokecli"

### 5. Mira qué se equivoca Claude

Esta es la parte útil del ejercicio.

Si Claude omite un grupo de comandos, agrégalo. Si usa los flags equivocados, agrega un ejemplo que sí funcione. Si en vez de `pokecli` intenta usar comandos genéricos de shell, ajusta la descripción y los ejemplos.

No estás tratando de escribir un documento largo. Estás tratando de quitar fricción.

### 6. Ajusta el skill una pasada a la vez

Después de algunos prompts, tu archivo normalmente mejora de formas obvias:

- agrega frases de disparo que olvidaste la primera vez
- agrega uno o dos ejemplos para `image download` y `pokemon moves`
- lista flags compartidos como `--format json` y `--no-cache`
- mueve notas profundas de campos a un archivo de referencia solo si de verdad lo necesitas

Ese ciclo de retroalimentación es la lección real. El mejor `SKILL.md` no es el más largo. Es el que le da a Claude un camino corto hacia el comando correcto.

---

## 🔎 Explora El Repo

Una cosa que me gusta de este proyecto es que la estructura del repo se refleja bien en el skill final.

A nivel de CLI, la app de Typer sigue teniendo grupos de comandos de primer nivel fáciles de reconocer, como `pokemon`, `berry`, `item`, `move`, `location`, `game`, `image` y `cache`, pero el repositorio ahora también incluye muchas apps de Typer de nivel más bajo, agrupadas dentro de esas familias y con la misma interfaz.

Eso le da al skill dos estructuras útiles al mismo tiempo: familias de comandos fáciles de reconocer para humanos y un contrato uniforme de `get`/`list` para agentes. Luego, los ejemplos de comandos completan operaciones especializadas como `moves`, `species`, `evolution`, `encounters`, `forms`, `can-learn`, `image`, `stats` y `clear`.

A nivel de comportamiento, el proyecto también nos da los detalles correctos que conviene mencionar en el skill:

- todos los comandos `get` soportan `--no-cache`
- todos los comandos `get` soportan `--format table|json`
- los comandos `list` usan `--limit` y `--offset`
- las descargas de imágenes soportan `--output` y `--variant`
- las entradas del caché viven en `~/.pokecli/cache.json`

Si quieres revisar el código de la herramienta, empieza por estas fuentes:

- el README del proyecto en {{< extlink href="https://github.com/jebucaro/pokecli" >}}pokecli{{< /extlink >}}
- los módulos de comandos en `src/pokecli/commands/`
- la lógica de los alias en `src/pokecli/commands/_group.py`
- el punto de entrada de la app en `src/pokecli/main.py`

---

## Ideas Clave

1. Un skill hace que un CLI sea más fácil de usar para Claude Code sin cambiar el CLI en sí.
2. La descripción del frontmatter es la línea más importante porque decide cuándo se activa el skill.
3. `allowed-tools` le da al skill un límite de seguridad claro.
4. El mejor cuerpo de un skill es una guía corta de comandos, no un tutorial largo.
5. Los archivos de referencia te ayudan a mantener el `SKILL.md` principal pequeño y enfocado.
6. Un CLI limpio como pokecli es un candidato fuerte para este patrón porque sus grupos de comandos ya encajan bien en un skill.

---

## Comentarios Finales

Esta es la parte que más útil me parece de los skills: no te piden reconstruir tus herramientas para IA. Te piden describir tus herramientas de una manera que el agente pueda usar bien.

Si ya tienes un CLI de Python con comandos claros y una salida predecible, probablemente estás más cerca de una herramienta nativa para IA de lo que crees. En muchos casos, la pieza que falta no es un protocolo nuevo. Es un buen `SKILL.md`.

Por eso también quise convertir la charla técnica en un ejemplo concreto. La idea es más fácil de creer cuando puedes apuntar a un CLI real, a un archivo de skill real y a un flujo que pasa de uno al otro de forma limpia.

---

Foto de {{< extlink href="https://unsplash.com/@jmanalog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Jay{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/shallow-focus-photo-of-pokeball-dkFJST9zZZo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Pokémon y los nombres de los personajes de Pokémon son marcas registradas de Nintendo.
