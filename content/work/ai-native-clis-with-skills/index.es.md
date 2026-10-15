---
title: 'Convierte tus scripts y CLI en herramientas AI-Native con skills'
slug: 'clis-ai-native-con-skills'
subtitle: 'Mi charla en AWS Community Day Guatemala 2026: cómo darle a un agente de IA una guía corta de los scripts y CLI que ya tienes, con pokecli como demo.'
description: 'Cómo convertir tus scripts y CLI en herramientas AI-Native con un SKILL.md, desde mi charla en AWS Community Day Guatemala 2026, con pokecli como ejemplo práctico.'
date: 2026-10-10T15:05:00-06:00
draft: false
image: 'images/cover.png'
work-types: ['Talk']
talk:
    event: 'AWS Community Day Guatemala 2026'
    venue: 'Salón Fuego, Universidad Rafael Landívar'
    location: 'Ciudad de Guatemala, Guatemala'
    endDate: '2026-10-10T15:55:00-06:00'
    language: 'es'
    repo: 'jebucaro/pokecli'
---

Abrí mi charla en AWS Community Day Guatemala 2026 con una pregunta que, coincidentemente, fue muy parecida a la que abrió el keynote del evento:

> ¿Quién ha sentido que, si no está construyendo un servidor MCP o usando un Agent Framework gigante, ya se quedó atrás?

Les dije que es natural sentir FOMO cuando parece que todos ya lo están haciendo, pero que no tienes por qué preocuparte, porque puedes empezar con lo que ya tienes. Después pregunté qué hacemos cuando se cae producción, y las respuestas fueron las de siempre: revisar un log, correr un query, armar un script. Nadie dijo que se iba a poner a construir un agente.

De eso se trató la charla. Los scripts y CLI que ya tienes pueden convertirse en herramientas que un agente usa, y casi siempre lo único que falta es una guía corta (un `SKILL.md`) que le explique al agente cuándo usarlos y cómo. Esta página es la versión escrita de esa charla, junto con `pokecli`, el CLI que usé para la demo. Todo empezó como una charla interna en el trabajo llamada _Make Your CLI Tools AI-Native with SKILL.md_, y los comentarios que recibí me dejaron claro que hacía falta un ejemplo práctico que la gente pudiera revisar y reutilizar, así que construí pokecli.

## Qué hace el agente y qué hace el script

Hoy, cuando algo falla, muchos pegamos medio log en un chat, el modelo responde algo como "creo que el error es...", y después nos toca ir a verificar si tiene razón. En la práctica le estamos pidiendo al modelo que calcule cosas que deberían estar programadas, y eso tiene un costo: la respuesta cambia de una corrida a otra, el modelo solo ve una parte del contexto y, cuando rellena los huecos, puede inventar.

Lo que propuse en la charla es repartir mejor el trabajo. El agente decide qué correr y cuándo, un CLI determinista hace el trabajo y devuelve una salida estructurada, y con esa salida el agente arma la respuesta. El `SKILL.md` es el manual que conecta las dos partes, y para eso no necesitas servidores ni infraestructura nueva.

> El agente decide, el script ejecuta.

Antes de tocar código, vale la pena anotar 2 o 3 casos de uso reales. Para cada uno escribo lo que diría el usuario, los pasos que hacen falta y el resultado que espero. Este es el que usé en la charla:

```text
Caso de uso: Reporte de órdenes por cliente
Trigger:  "¿cuántas órdenes tuvo el cliente X?"
          "reporte de ventas del mes"
Pasos:
  1. reporte orders --user-id X --from ... --format json
  2. Calcular totales / comparar periodos
Resultado: Cifras reales + el comando usado
```

Ese ejercicio te ahorra trabajo después, porque casi todo pasa directo al skill: los parámetros terminan siendo flags, las frases del usuario sirven para el trigger y los pasos se convierten en ejemplos. La herramienta ya la tienes, lo que el skill aporta es saber cuándo y cómo usarla.

## Los cuatro pilares

Resumí el proceso en cuatro pilares, y funcionan igual para un script de Python, un CLI de Node o un wrapper de bash sobre una API interna.

### 1. Un CLI determinista

Casi todos los scripts empiezan así, con todo quemado en el código:

```python
# reporte.py
conn = connect("prod-db.internal")
rows = query("SELECT * FROM orders WHERE user_id = 4821")
print(rows)
```

Un agente no puede hacer mucho con eso. El primer paso es convertir cada valor que cambia en un flag, incluyendo el ambiente y el formato de salida:

```bash
reporte orders \
  --user-id 4821 \
  --env prod \
  --format json
```

Ese cambio es más o menos el 80% del trabajo. Un CLI que le sirve a un agente es el mismo que te serviría en un pipeline, así que esta lista probablemente te suene conocida:

{{< checklist title="Un CLI que un agente puede usar" >}}

- Todo valor que cambia es un argumento o un flag.
- Los errores son accionables y dicen qué valores acepta.
- La salida es estructurada, por ejemplo `--format json|table|csv`.
- Los datos van a stdout, los logs y errores a stderr.
- Los exit codes significan algo: `0` ok, `1` error, `2` uso incorrecto.
- Nada es interactivo, porque un prompt esperando input deja al agente colgado.
- Todo lo que borre o modifique datos lleva `--dry-run` o `--yes`, para que nadie corra un DELETE en prod por un malentendido.

{{< /checklist >}}

Y por favor, no escribas el parsing de argumentos a mano. En Python tienes Typer, Click o argparse, y en Node, Commander.js, yargs u oclif. Distribuirlo también es un solo comando: `uv tool install` para Python o `npm i -g` para Node. Con Typer, el comando de reporte de arriba queda como una simple función:

```python
@app.command()
def orders(user_id: int, env: str = "dev", format: str = "table"):
    ...
```

### 2. Una description que el agente pueda encontrar

Para decidir si usa tu skill, el agente lee la `description` y no tu código. Es el único campo del frontmatter que siempre está cargado, y con eso decide si el skill aplica a lo que le están pidiendo. Mira la diferencia entre estas dos:

```yaml
# Demasiado vaga
description: Herramienta de reportes.

# Útil
description: Genera reportes de órdenes, ventas y usuarios desde la base de datos de la plataforma. Úsala cuando el usuario pida métricas, reportes, totales por fecha o información de un cliente específico que la plataforma no muestra.
```

La description funciona como el SEO de tu herramienta, con la diferencia de que quien la lee es un agente. {{< extlink href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en" >}}La guía de Anthropic para construir skills{{< /extlink >}} tiene las reglas que sigo:

- Dice qué hace, cuándo usarla y cuáles son sus capacidades principales.
- Incluye frases que un usuario diría de verdad, y tipos de archivo si son relevantes.
- Tiene menos de 1024 caracteres y no usa `<` ni `>`, porque termina dentro del system prompt.
- El `name` va en kebab-case, coincide con el nombre de la carpeta y no incluye "claude" ni "anthropic".
- Si el skill se activa donde no debe, lleva negative triggers como "NO usar para consultas generales de finanzas".

### 3. Ejemplos que muestren el camino

Los ejemplos le enseñan al agente cómo se usa tu herramienta. Cada uno tiene tres partes: lo que pediría el usuario, el comando exacto con sus flags y la salida esperada, para que el agente se dé cuenta cuando algo salió mal.

```markdown
## Ejemplos

**Usuario:** "¿Cuántas órdenes tuvo el cliente 4821 este mes?"

    reporte orders --user-id 4821 --from 2026-09-01 --format json

**Salida esperada:**

    {"user_id": 4821, "total_orders": 12, "total_amount": 3450.00}
```

También vale la pena documentar qué hacer cuando algo falla, con el error, la causa y la solución:

```markdown
## Troubleshooting

**Error:** exit 2, "user not found"
**Causa:** el ID no existe en ese ambiente
**Solución:** confirmar el ID con el usuario y el --env usado
```

Las instrucciones tienen que ser específicas. Si escribes "Valida los datos antes de continuar", el agente se queda adivinando qué significa validar. En cambio, "Corre `reporte validate --input archivo.csv`, y si falla, revisa que las fechas estén en YYYY-MM-DD y que estén los campos obligatorios" le da algo concreto que hacer. La guía de Anthropic lo resume en una frase que también usé en la charla:

> Code is deterministic; language interpretation isn't.
>
> {{< extlink href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en" >}}Anthropic{{< /extlink >}}

### 4. Todo empaquetado en SKILL.md

Un skill no es más que una carpeta con un `SKILL.md` adentro:

```text
.claude/skills/
└── orders-report/
    ├── SKILL.md       # obligatorio
    ├── scripts/       # tu CLI o wrappers
    ├── references/    # docs bajo demanda
    └── assets/        # plantillas, schemas
```

Ponlo en `./.claude/skills` si es para un proyecto, o en `~/.claude/skills` si lo quieres disponible en todos tus proyectos. Ojo con algunos detalles que suelen confundir: el archivo se tiene que llamar exactamente `SKILL.md`, la carpeta va en kebab-case (`orders-report`, nunca `Orders Report` ni `orders_report`) y el README va en la raíz del repo, fuera de la carpeta del skill.

Lo que hace que esto escale es el progressive disclosure, es decir, que el agente carga el skill por capas:

1. El `name` y la `description` del frontmatter están siempre cargados, y con eso le alcanza para decidir si el skill aplica.
2. El cuerpo del `SKILL.md` se carga cuando el skill se activa, por eso conviene que no pase de 5,000 palabras.
3. Los archivos de `references/` se cargan solo cuando el agente los necesita, y lo que esté en `scripts/` se ejecuta sin entrar al contexto.

Para un skill de un CLI yo siempre agrego el campo opcional `allowed-tools`. En pokecli se ve así:

```yaml
allowed-tools: Bash(pokecli:*)
```

Esto le dice a Claude Code que el skill solo puede correr comandos de `pokecli`, así que también funciona como un límite de seguridad. Por cierto, esta estructura no la inventé yo, la tomé del skill de {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}} de Microsoft, que tiene una description corta, un cuerpo enfocado y deja el detalle extra en archivos de referencia.

## Inicio rápido con pokecli

`pokecli` es el CLI que construí para la demo. Está escrito en Python con tipos, consulta PokeAPI y cubre Pokémon, movimientos, habilidades, items, tipos y evoluciones, con una caché local para que las búsquedas repetidas no salgan a la red. Así lo instalas junto con el skill.

### Instala el CLI con `uv`

{{< callout important>}}
Es requisito tener instalado `uv` antes de continuar. Para instalar `uv`, puedes seguir {{< extlink href="https://docs.astral.sh/uv/getting-started/installation/" >}}la guía de instalación en el sitio de Astral{{< /extlink >}}.
{{< /callout >}}

```bash
uv tool install git+https://github.com/jebucaro/pokecli
```

### Instala el skill de Claude

```bash
pokecli install --skills
```

{{< gallery caption="Instalación de pokecli y SKILL.md" >}}
{{< gallery-image src="images/uv-install-pokecli.png" alt="Instalación de pokecli usando el gestor de paquetes uv." >}}
{{< gallery-image src="images/pokecli-install-skills.png" alt="Instalación de los skills de pokecli usando el comando install." >}}
{{< /gallery >}}

El comando `install --skills` no genera nada nuevo: el `SKILL.md` y sus archivos de referencia vienen dentro del paquete, y lo único que hace es copiarlos a `~/.claude/skills/pokecli/`, así que no necesitas clonar el repo. Podrías copiar los archivos a mano, pero agregué el comando para que el ejemplo fuera fácil de probar.

Los 18 recursos usan los mismos tres comandos (`get`, `list` y `search`), y hay seis comandos de tarea, como `moves`, `can-learn` y `sprite`, para preguntas que no se responden con un solo registro. Con conocer esa estructura, el skill ya puede dar con el comando correcto.

{{< callout note >}}
El skill no reemplaza la documentación del CLI. Le da a Claude Code una forma más corta y práctica de llegar a la misma lista de comandos.
{{< /callout >}}

Ya instalado, Claude Code sabe cuándo usar `pokecli` y qué comando responde cada tipo de pregunta:

{{< gallery caption="" >}}
{{< gallery-video src="images/pokecli-skill-in-action-claude-code.webm" alt="Claude Code usando SKILL.md para interactuar con pokecli." >}}
{{< /gallery >}}

## pokecli de cerca

{{< gallery caption="Comando de ayuda de pokecli" >}}
{{< gallery-image src="images/pokecli-help.png" alt="Windows Terminal mostrando el resultado del comando de ayuda de pokecli" >}}
{{< /gallery >}}

El `SKILL.md` del repo tiene 192 líneas y en él se ven los cuatro pilares. Estas son las partes que vale la pena ver con calma.

### Frontmatter y la gramática completa

```yaml
---
name: pokecli
description: Queries Pokemon, moves, items, abilities, types, locations, game data, forms, machines, encounters, evolutions, and other PokeAPI-backed resources via the pokecli CLI. Use when the user needs Pokemon stats, move info, type matchups, catch locations, evolution chains, sprite downloads, regional or generation data, or cache management. Also use when the user mentions pokecli, pokedex, or PokeAPI.
allowed-tools: Bash(pokecli:*)
user-invocable: false
---
```

La descripción lleva el propósito de la herramienta y las frases que un usuario podría escribir, como `pokedex`, `Pokemon stats` o `download sprites`. Después el cuerpo abre con todos los comandos que el agente va a necesitar, en una sola pantalla:

```markdown
## The whole grammar

Three patterns cover every resource:

    pokecli get <resource> <name_or_id>     # one record
    pokecli list <resource>                 # browse, paginated
    pokecli search <resource> <query>       # find a name

Plus six commands that answer a question rather than return a record:

    pokecli moves <pokemon>                 # every learnable move
    pokecli can-learn <pokemon> <move>      # exit 0 = yes, exit 1 = no
    pokecli evolution <pokemon>             # full chain, from any member
    pokecli encounters <pokemon>            # where it appears in the wild
    pokecli forms <pokemon>                 # Mega, Alolan, Gigantamax varieties
    pokecli sprite <pokemon> -o <path>      # download an image

There is exactly one command path per behavior. No aliases, no nested groups.
```

Con eso en contexto, el agente no necesita correr `--help` para encontrar un comando, y nunca tiene que escoger entre dos formas de pedir lo mismo.

### Salida TOON

pokecli decide el formato de salida según quién la va a leer. En una terminal ves tablas de Rich, pero ese marcado consume tokens, igual que toda la puntuación de JSON. Por eso, cuando la salida se captura (que es lo que pasa cuando la corre un agente), pokecli imprime TOON, una notación compacta que ocupa más o menos un 40% menos que JSON. El skill le pide al agente que no toque `--format` y que use `--format json` solo cuando necesite contar, sumar o filtrar. Así describe la salida:

```text
## Reading the default output

This is what you get with no `--format` (TOON):

- A single record is `label:` followed by indented `key: value` pairs
- A collection is `label[count]{fields}:` followed by indented rows
- Aggregates like `count`, `total_moves`, `methods` appear as top-level keys
- Every response ends with `help[]` hints naming valid follow-up commands
```

Los hints de `help[]` son lo que más me gusta. `pokecli get pokemon pikachu` termina con `help[3]: pokecli moves pikachu,pokecli evolution pikachu,pokecli encounters pikachu`, así que la misma salida le sugiere al agente el siguiente comando. TOON existe precisamente por el skill: cuando escribí una regla sobre el costo en tokens, me di cuenta de que la herramienta no tenía ningún formato de salida que valiera la pena recomendar.

### Un solo camino por comportamiento

{{< challenge >}}
{{< challenge-problem >}}
La primera versión de pokecli tenía un grupo por familia de recursos (`pokecli pokemon get pikachu`, `pokecli move get thunderbolt`), grupos más antiguos sin anidar que seguían ahí como comandos ocultos, y alias cortos para humanos como `pokecli pokemon pikachu`. Todos funcionaban, así que el skill necesitaba una regla extra que le dijera al agente qué forma preferir, y una lista de los alias para que los reconociera.
{{< /challenge-problem >}}
{{< challenge-decision >}}
En la v0.2 consolidé el CLI en `get`, `list` y `search` para los 18 recursos, más seis comandos de tarea, y quité los alias:

```bash
# antes
pokecli pokemon get pikachu
pokecli pokemon pikachu          # alias
pokecli move get thunderbolt

# v0.2
pokecli get pokemon pikachu
pokecli get move thunderbolt
```

Ahora hay una sola forma de pedir cada cosa, así que la regla sobre preferir los comandos canónicos desapareció del skill, y el agente tiene menos formas de equivocarse.
{{< /challenge-decision >}}
{{< /challenge >}}

Esta es una sesión real en Claude Code, donde pedí las estadísticas de Pikachu y luego una comparación entre Thunderbolt y Flamethrower:

{{< agent-session "pokecli-demo" >}}

{{< github repo="jebucaro/pokecli" >}}

## ¿Cuándo está listo un skill?

Un skill está listo cuando lo probaste, y hay dos cosas que probar. La primera es la activación: el skill tiene que cargarse con peticiones obvias y con paráfrasis, y no activarse con las que no tienen relación. Una buena meta es acertar en un 90% de 10 a 20 frases. Para pokecli, las frases podrían verse así:

{{< checklist >}}
{{< checklist-section title="Debería activarlo" >}}

- "Busca las estadísticas de Pikachu"
- "Muéstrame datos de berries desde PokeAPI"
- "Descarga un sprite de Charizard"
- "Compara Thunderbolt y Flamethrower"

{{< /checklist-section >}}
{{< checklist-section title="No debería activarlo" mark="cross" >}}

- "Ayúdame a escribir una clase en Python"
- "¿Cómo está el clima hoy?"
- "Resume esta transcripción de reunión"

{{< /checklist-section >}}
{{< /checklist >}}

La segunda es el comportamiento, que se prueba corriendo comandos reales y revisando las salidas, los errores y los casos extremos:

```bash
pokecli get pokemon pikachu
pokecli can-learn pikachu thunderbolt
pokecli get item master-ball --format json
pokecli sprite 25 -o /tmp/pika.png
pokecli cache clear --resource pokemon
```

Si estos funcionan, sabes que los ejemplos del skill coinciden con lo que hace la herramienta. Corre el primero en tu terminal y después otra vez pasándolo por `cat`, y vas a ver cómo la salida cambia de tablas de Rich a TOON.

Cuando algo no sale bien, el síntoma casi siempre te dice qué arreglar. Si el skill no se carga, a la descripción le faltan palabras clave, y si se carga con peticiones que no tienen nada que ver, le hacen falta negative triggers. Cuando los resultados cambian de una vez a otra, son las instrucciones las que necesitan trabajo. Un truco que me sirve para depurar es preguntarle al agente "¿Cuándo usarías el skill de pokecli?" y leer lo que entendió.

Antes de dar un skill por terminado, reviso esta lista:

{{< checklist title="Checklist del skill" >}}

- 2 o 3 casos de uso concretos por escrito
- Una carpeta en kebab-case con un archivo llamado exactamente `SKILL.md`
- Frontmatter entre líneas `---`, con un `name` en kebab-case
- Una `description` que dice qué y cuándo, con menos de 1024 caracteres y sin `<` ni `>`
- Instrucciones accionables, ejemplos y troubleshooting
- Archivos de referencia enlazados desde el `SKILL.md`
- Probado con peticiones obvias, paráfrasis y temas sin relación

{{< /checklist >}}

## Tu tarea

Al final de la charla le dejé a la audiencia esta tarea para el lunes:

1. Escoge un script que uses cada semana.
2. Pasa los valores hardcodeados a flags y agrega salida en JSON.
3. Escribe una `description` que diga qué hace y cuándo usarlo.
4. Agrega 2 o 3 ejemplos con su salida esperada.
5. Guárdalo como `SKILL.md` y pruébalo con tu agente.

Si no tienes un script a mano, usa pokecli y escribe tú mismo el skill. Primero remueve el skill si lo instalaste con la CLI (lo puedes reinstalar después con `pokecli install --skills`):

```bash
rm -rf ~/.claude/skills/pokecli
```

Luego crea una carpeta para el ejercicio, con la ruta donde Claude va a buscar el skill local:

```bash
mkdir -p pokecli-skill-lab/.claude/skills/pokecli
cd pokecli-skill-lab
```

Dentro de esa carpeta, crea `./.claude/skills/pokecli/SKILL.md`, y luego inicia Claude desde el mismo directorio para que tome el skill local:

```bash
claude
```

No te preocupes por que el archivo quede perfecto a la primera. Empieza con el frontmatter y unos cuantos comandos, prueba un prompt como "Usa pokecli para buscar las estadísticas de Pikachu", y después limpia el contexto y vuelve a intentarlo sin mencionar pokecli. Fíjate en qué se equivoca Claude. Si se salta algún comando, agrégalo, y si usa flags equivocados, agrega un ejemplo que funcione. Si termina usando comandos genéricos de shell, ajusta la descripción. Cuando te guste cómo quedó, compáralo con el que trae pokecli.

Cerré la charla diciendo que nadie se quedó atrás, porque los scripts que ya escribiste son justamente lo que un agente necesita para hacer trabajo real. Lo que les falta es lo que vimos aquí: que sean deterministas, que tengan una buena description, unos cuantos ejemplos y un `SKILL.md` que lo junte todo.

¿Qué script vas a convertir primero? Escríbeme en {{< extlink href="https://www.linkedin.com/in/jonathanbucaro/" >}}LinkedIn{{< /extlink >}} y cuéntame cómo te fue.

---

Foto de {{< extlink href="https://unsplash.com/@jmanalog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Jay{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/shallow-focus-photo-of-pokeball-dkFJST9zZZo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Pokémon y los nombres de los personajes de Pokémon son marcas registradas de Nintendo.
