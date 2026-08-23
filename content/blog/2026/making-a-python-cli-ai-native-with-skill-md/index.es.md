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

## Por qué construí esto

Hace poco di una charla técnica interna en el trabajo llamada **_Make Your CLI Tools AI-Native with SKILL.md_**. La respuesta me dijo que la idea conectó, pero también dejó algo claro: necesitaba un ejemplo práctico que la gente pudiera revisar y reutilizar. Este post es ese ejemplo.

Me gustan los CLI que hacen una cosa bien, y `pokecli` es un buen ejemplo de eso. Tiene una lista de comandos limpia, una salida clara y un flujo que se siente natural en la terminal.

{{< gallery caption="pokecli ejecutando el commando help" >}}
{{< gallery-image src="images/pokecli-help.webp" alt="Windows Terminal mostrando el resultado de ejecutar el comando help de pokecli" >}}
{{< /gallery >}}

{{< gallery caption="pokecli ejecutando los comandos pokemon y move" >}}
{{< gallery-image src="images/pokecli-pokemon.webp" alt="Windows Terminal mostrando el resultado de ejecutar el comando pokemon de pokecli para buscar los datos de Charizard" >}}
{{< gallery-image src="images/pokecli-move.webp" alt="Windows Terminal mostrando el resultado de ejecutar el comando move de pokecli para buscar los datos de Flamethrower and Thunderbolt" >}}
{{< /gallery >}}

No necesitas rediseñar un CLI para hacerlo más útil para un agente de IA. En muchos casos, la pieza que falta es una guía compacta que le diga al agente cuándo usar la herramienta, qué comandos existen y cómo aplicarlos de forma segura.

## El problema que resuelve un skill

El texto de ayuda de un CLI es excelente para humanos, pero un agente que solo ve la salida de ayuda tiene que resolver una y otra vez las mismas preguntas durante la tarea: qué grupos de recursos existen, qué comandos soportan `--no-cache`, qué formatos de salida hay, cómo funcionan las descargas de imágenes, qué comandos del caché es seguro ejecutar. Eso significa que el modelo gasta parte de su contexto volviendo a aprender la herramienta en vez de resolver la petición del usuario.

Un skill convierte un CLI en una interfaz más pequeña y más directa para un agente. En Claude Code normalmente tiene tres capas:

1. **Frontmatter**: el nombre del skill, la descripción y las herramientas permitidas; Claude lo lee todo el tiempo para decidir si debe activarse
2. **Cuerpo de `SKILL.md`**: la guía de comandos que el agente lee una vez que se activa el skill
3. **Referencias**: documentación extra que solo se carga cuando el archivo principal no basta

El frontmatter se encarga de activar el skill, el cuerpo le da al agente un mapa corto de comandos, y las referencias guardan el detalle de campo que solo importa en algunos casos. Este es el patrón que apliqué a pokecli, y también es el que hay detrás del skill de {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}} de Microsoft: mantener pequeño el disparador que siempre está cargado, dejar el cuerpo enfocado y mover el detalle extra a archivos de referencia solo cuando haga falta.

## Inicio rápido

### Instala el CLI con `uv`

{{< callout important>}}
Es requisito tener instalado `uv` antes de continuar. Para instalar `uv`, puedes seguir {{< extlink href="https://docs.astral.sh/uv/getting-started/installation/" >}}la guía de instalación en el sitio de Astral{{< /extlink >}}.
{{< /callout >}}

```bash
uv tool install git+https://github.com/jebucaro/pokecli
```

Después puedes desinstalar la herramienta con este comando:

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

También puedes copiar los archivos del skill a mano o con un script pequeño. Agregué `install --skills` para que el ejemplo estuviera completo y fuera fácil de ejecutar.

### Opcional: entorno local de desarrollo

```bash
git clone https://github.com/jebucaro/pokecli
cd pokecli
uv sync
uv run pokecli --help
```

pokecli sigue teniendo grupos de comandos de primer nivel fáciles de reconocer, como `pokemon`, `berry`, `item`, `move`, `location`, `game`, `image` y `cache`, pero el repositorio ahora agrupa muchos recursos de nivel más bajo dentro de esas familias en vez de exponerlos todos como comandos planos. Lo importante para el skill no es el número exacto de grupos, sino que la mayoría de los recursos soportan `get <name_or_id>` y `list`, mientras que Pokemon agrega comandos extra de navegación como `moves`, `species`, `evolution`, `encounters` y `forms`.

### Prueba el CLI antes de escribir el skill

Agrega `uv run` antes de cada comando si estás probando localmente con el entorno de desarrollo.

```bash
pokecli pokemon get pikachu
pokecli berry list --limit 5
pokecli pokemon image 25 -o /tmp/pikachu.png
pokecli cache stats
```

{{< callout note >}}
El skill no reemplaza la documentación de la CLI. Le da a Claude Code un punto de entrada más pequeño y más útil hacia la misma lista de comandos.
{{< /callout >}}

Una vez instalado, Claude Code entiende mucho mejor cómo usar la herramienta: cuándo conviene usar `pokecli`, qué comandos pertenecen a cada recurso, qué flags comparten los comandos `get`, cómo descargar sprites, y cómo revisar y limpiar la caché local.

{{< gallery caption="" >}}
{{< gallery-video src="images/pokecli-skill-in-action-claude-code.webm" alt="Claude Code usando SKILL.md para interactuar con pokecli." >}}
{{< /gallery >}}

## El skill de pokecli de cerca

El `SKILL.md` actual en el repositorio tiene cerca de 180 líneas: frontmatter, un "Agent rule" corto, un quick start, un árbol de decisión y una sección de comandos. En vez de pegar el archivo completo, estas son las tres partes que vale la pena leer con cuidado.

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

La descripción lleva tanto el propósito de la herramienta como las frases de disparo que un usuario podría decir de verdad, como `pokedex`, `Pokemon stats` o `download sprites`. Agregué la regla para el agente después de que `pokecli` sumó una capa de comandos más corta y pensada para humanos (más abajo hablo de eso): cuando un CLI ofrece dos formas válidas de pedir lo mismo, el skill necesita decir cuál debería preferir el agente por defecto.

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

## Cómo funciona

Lo bueno de este patrón es que se mantiene cerca de la herramienta misma. No estás inventando una interfaz nueva, estás reorganizando el CLI como una guía amigable para un agente.

### El flujo de instalación

Instalar `pokecli` con `uv tool install` y luego ejecutar `pokecli install --skills` no genera un skill nuevo desde cero. Copia los archivos del skill que ya vienen dentro del paquete instalado hacia el lugar donde Claude Code los espera: `~/.claude/skills/pokecli/SKILL.md`, `references/api-fields.md` y `references/workflows.md`. Eso importa porque el usuario no necesita tener el repo clonado de forma local, la herramienta instalada ya trae lo que necesita.

### `allowed-tools`: la capa de seguridad

Esta línea importa más de lo que parece:

```yaml
allowed-tools: Bash(pokecli:*)
```

Le dice a Claude Code que este skill puede ejecutar comandos de `pokecli`, pero no comandos arbitrarios de shell. Ese es un buen valor por defecto para un skill enfocado en tareas: no es solo una capa de comodidad, también es un límite.

### El cuerpo: una guía rápida, no un tutorial

El cuerpo debería leerse como una guía rápida para un agente: secciones cortas, grupos de comandos que reflejen el CLI, ejemplos que se puedan copiar y ejecutar, nada de teoría larga en medio de la lista de comandos. Dentro de cada grupo de primer nivel, el skill muestra las operaciones que más importan, como `get`, `list`, `moves`, `download`, `stats` y `clear`, mientras que recursos anidados como `pokemon form`, `move damage-class`, `location area` y `game region` quedan cerca de sus familias principales. El detalle que no cabe en esa guía rápida, como qué significa `base_experience` o qué variantes de sprite existen, va en `references/api-fields.md`; las recetas de varios pasos van en `references/workflows.md`.

### Alias para humanos: una sola clase, sin comandos duplicados

A mitad de este proyecto, pokecli sumó una segunda forma, más corta, de escribir los mismos comandos: `pokecli pokemon pikachu` en vez de `pokecli pokemon get pikachu`. Eso no es un árbol de comandos duplicado, es una sola subclase pequeña de `TyperGroup` que reescribe el primer argumento no reconocido como `get` antes de que Typer lo resuelva:

```python
class ResourceGroup(TyperGroup):
    def resolve_command(self, ctx, args):
        if args:
            first = args[0]
            if not first.startswith("-") and first not in self.commands:
                args = ["get", *args]
        return super().resolve_command(ctx, args)
```

Para el skill, esto significa que Claude Code ahora tiene dos formas válidas de pedir lo mismo. El `SKILL.md` resuelve eso manteniendo el árbol de decisión con la forma canónica, `pokemon get <name>`, y listando los alias aparte, así el agente tiene un valor por defecto y no tiene que adivinar cuál forma es más segura para un script.

## Comparación lado a lado

Usé {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}} de Microsoft como patrón de referencia para este skill de pokecli. La meta no era copiar el flujo de trabajo del navegador, sino reutilizar la misma forma del skill: un disparador pequeño, una guía de comandos enfocada y el detalle extra movido a archivos de referencia.

| Decisión de diseño        | Playwright CLI                                | pokecli                                                                    |
| ------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| Disparador principal      | tareas de automatización del navegador        | tareas de consulta de datos de Pokémon                                     |
| Alcance de la herramienta | `Bash(playwright-cli:*)`                      | `Bash(pokecli:*)`                                                          |
| Forma del quick start     | navegar, hacer clic, escribir, presionar      | obtener y listar datos, revisar movimientos de Pokémon, descargar imágenes |
| Flujo                     | navegar, interactuar, volver a tomar snapshot | consultar, explorar, revisar movimientos, descargar, usar caché            |
| Grupos de comandos        | acciones y sesiones del navegador             | grupos base más comandos agrupados por recurso anidado                     |
| Documentación extra       | referencias separadas del skill               | `references/api-fields.md` y `references/workflows.md`                     |

Los comandos y el caso de uso cambian, pero la estructura sigue igual, y esa es la parte útil del patrón.

## Prueba tu skill

{{< extlink href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en" >}}La guía de Anthropic sobre skills{{< /extlink >}} ayuda bastante aquí: prueba tanto la activación como el comportamiento.

Consultas que deberían activar el skill:

- "Busca las estadísticas de Pikachu"
- "Muéstrame datos de berries desde PokeAPI"
- "Descarga un sprite de Charizard"
- "Compara Thunderbolt y Flamethrower"
- "Usa pokecli para explorar items"

Consultas que no deberían activarlo:

- "Ayúdame a escribir una clase en Python"
- "¿Cómo está el clima hoy?"
- "Crea una hoja de cálculo"
- "Resume esta transcripción de reunión"

Y comprobaciones funcionales contra el CLI real:

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

Si estos comandos funcionan, los ejemplos del skill están bien anclados a la herramienta real.

## Reto: crea uno tú mismo

Si quieres llevar esto un paso más allá, quita el skill listo de pokecli y crea el tuyo. Es una buena prueba de qué puede inferir Claude solo a partir del CLI, dónde se traba y qué tipo de guía de verdad ayuda.

Primero, quita del camino el skill incluido (puedes reinstalarlo después con `pokecli install --skills`):

```bash
rm -rf ~/.claude/skills/pokecli
```

Luego crea una carpeta limpia de proyecto con la ruta local del skill que Claude va a leer:

```bash
mkdir -p pokecli-skill-lab/.claude/skills/pokecli
cd pokecli-skill-lab
```

Dentro de esa carpeta, crea `./.claude/skills/pokecli/SKILL.md`. No intentes escribir el skill perfecto en el primer intento, empieza con la versión útil más pequeña: frontmatter con `name`, `description` y `allowed-tools`, algunos comandos de quick start, grupos de comandos que coincidan con el CLI, algunos ejemplos que Claude pueda copiar y ejecutar, y archivos de referencia opcionales para detalles más profundos. Ya tienes la implementación completa antes en este post para usar como referencia.

Ahora inicia Claude desde dentro de la carpeta para que pueda ver el skill local:

```bash
claude
```

Prueba prompts como "Usa pokecli para buscar las estadísticas de Pikachu" o "Descarga un sprite de Charizard con pokecli," y después limpia el contexto y prueba los mismos prompts sin mencionar `pokecli` explícitamente.

Mira qué se equivoca Claude: si omite un grupo de comandos, agrégalo; si usa los flags equivocados, agrega un ejemplo que sí funcione; si en vez de `pokecli` recurre a comandos genéricos de shell, ajusta la descripción y los ejemplos. No estás tratando de escribir un documento largo, estás tratando de quitar fricción.

Después de algunos prompts tu archivo suele mejorar de formas obvias: frases de disparo que olvidaste la primera vez, uno o dos ejemplos para `image download` y `pokemon moves`, flags compartidos como `--format json` y `--no-cache`, notas profundas de campos movidas a un archivo de referencia solo si de verdad lo necesitas. Ese ciclo de retroalimentación es la lección real. El mejor `SKILL.md` no es el más largo, es el que le da a Claude un camino corto hacia el comando correcto.

Si quieres revisar el código de pokecli mientras trabajas en esto, empieza por el README del proyecto en {{< extlink href="https://github.com/jebucaro/pokecli" >}}pokecli{{< /extlink >}}, los módulos de comandos en `src/pokecli/commands/`, la lógica de los alias en `src/pokecli/commands/_group.py`, y el punto de entrada de la app en `src/pokecli/main.py`.

## Comentarios finales

Esta es la parte que más útil me parece de los skills: no te piden reconstruir tus herramientas para IA, te piden describir tus herramientas de una manera que el agente pueda usar bien.

Si ya tienes un CLI con comandos claros y una salida predecible, probablemente estás más cerca de una herramienta nativa para IA de lo que crees. En muchos casos la pieza que falta no es un protocolo nuevo, es un buen `SKILL.md`. Por eso también quise convertir la charla técnica en un ejemplo concreto: la idea es más fácil de creer cuando puedes apuntar a un CLI real, a un archivo de skill real y a un flujo que pasa de uno al otro de forma limpia.

---

Foto de {{< extlink href="https://unsplash.com/@jmanalog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Jay{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/shallow-focus-photo-of-pokeball-dkFJST9zZZo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Pokémon y los nombres de los personajes de Pokémon son marcas registradas de Nintendo.
