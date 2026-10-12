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

Abrí mi charla en AWS Community Day Guatemala 2026 preguntando quién ha sentido que, si no está usando el framework de agentes más nuevo y más grande, ya se quedó atrás. Después pregunté qué es lo primero que hacemos cuando se cae producción. Revisamos un log, corremos un query o armamos un script. Nadie dijo que iba a construir un agente.

De esa diferencia se trató la charla. Los scripts y CLI que ya tienes pueden convertirse en herramientas que un agente usa, y lo que casi siempre falta es una guía corta, un `SKILL.md`, que le diga al agente cuándo usarlas y cómo. Esta página es la versión escrita de la charla, junto con `pokecli`, el CLI que usé para la demo. La idea empezó como una charla interna en el trabajo llamada _Make Your CLI Tools AI-Native with SKILL.md_, y lo que me dijeron ahí dejó claro que necesitaba un ejemplo práctico que la gente pudiera revisar y reutilizar. Ahí entra pokecli.

## El agente decide, el script ejecuta

Esto es lo que muchos hacemos hoy. Algo falla, pegamos medio log en un chat, el modelo responde "creo que el error es...", y luego vamos a verificar si es cierto. Le estamos pidiendo al modelo que calcule cosas que deberían estar programadas, así que la respuesta cambia de una corrida a otra, el modelo solo ve parte del contexto, y cuando rellena los huecos puede inventar.

Hay que invertir los papeles. El agente decide qué correr y cuándo, un CLI determinista hace el trabajo y devuelve una salida estructurada, y el agente interpreta esa salida y responde. `SKILL.md` es el manual que conecta las dos partes, y no necesitas servidores ni infraestructura nueva para eso.

Antes de escribir código, anota 2 o 3 casos de uso reales. Para cada uno, escribe lo que diría el usuario, los pasos que requiere y el resultado que esperas. Este es el que usé en la charla:

```text
Caso de uso: Reporte de órdenes por cliente
Trigger:  "¿cuántas órdenes tuvo el cliente X?"
          "reporte de ventas del mes"
Pasos:
  1. reporte orders --user-id X --from ... --format json
  2. Calcular totales / comparar periodos
Resultado: Cifras reales + el comando usado
```

Esto se traslada casi uno a uno al skill que vas a escribir después. Los parámetros se vuelven flags, las frases del usuario se vuelven el trigger y los pasos se vuelven ejemplos. La herramienta ya existe, y el skill le agrega la experiencia de cuándo y cómo usarla.

## Los cuatro pilares

Resumí el proceso en cuatro pilares. Funcionan igual para un script de Python, un CLI de Node o un wrapper de bash sobre una API interna.

### Hazla determinista

Casi todos los scripts empiezan así, con todo quemado en el código:

```python
# reporte.py
conn = connect("prod-db.internal")
rows = query("SELECT * FROM orders WHERE user_id = 4821")
print(rows)
```

Un agente no puede hacer mucho con eso. Convierte cada valor que cambia en un flag, y deja explícitos el ambiente y el formato de salida:

```bash
reporte orders \
  --user-id 4821 \
  --env prod \
  --format json
```

Ese cambio es como el 80% del trabajo. Un CLI que le sirve bien a un agente es uno que también funcionaría bien en un pipeline, así que la lista te va a sonar conocida:

{{< callout note >}}

- Todo valor que cambia es un argumento o un flag.
- Los errores son accionables y dicen qué valores acepta.
- La salida es estructurada, por ejemplo `--format json|table|csv`.
- Los datos van a stdout, los logs y errores a stderr.
- Los exit codes significan algo: `0` ok, `1` error, `2` uso incorrecto.
- Nada es interactivo. Un prompt esperando input deja al agente colgado.
- Todo lo que borre o modifique datos lleva `--dry-run` o `--yes`, para que nadie corra un DELETE en prod por un malentendido.

{{< /callout >}}

Y por favor no escribas el parsing de argumentos a mano. En Python, Typer, Click o argparse lo hacen por ti, y en Node, Commander.js, yargs u oclif. Distribuirlo es un solo comando en ambos casos: `uv tool install` para Python, `npm i -g` para Node. Con Typer, el comando de reporte de arriba es solo una función:

```python
@app.command()
def orders(user_id: int, env: str = "dev", format: str = "table"):
    ...
```

### Dale un trigger que el agente encuentre

El agente nunca lee tu código. Lee tu `description`, el único campo del frontmatter que siempre está cargado, y con eso decide si tu skill aplica a lo que le están pidiendo. Compara estas dos:

```yaml
# Demasiado vaga
description: Herramienta de reportes.

# Útil
description: Genera reportes de órdenes, ventas y usuarios desde la base de datos de la plataforma. Úsala cuando el usuario pida métricas, reportes, totales por fecha o información de un cliente específico que la plataforma no muestra.
```

Yo pienso en la descripción como el SEO de tu herramienta, solo que quien la lee es un agente. {{< extlink href="https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf?hsLang=en" >}}La guía de Anthropic para construir skills{{< /extlink >}} tiene las reglas que sigo:

- Di qué hace, cuándo usarla y sus capacidades principales.
- Incluye frases que los usuarios dirían de verdad, y tipos de archivo si importan.
- Quédate debajo de 1024 caracteres y evita `<` y `>`, porque va al system prompt.
- Usa un `name` en kebab-case que coincida con la carpeta, sin "claude" ni "anthropic".
- Agrega negative triggers cuando el skill aparezca donde no debe, como "NO usar para consultas generales de finanzas".

### Muéstrale el camino

Con los ejemplos el agente aprende cómo se usa tu herramienta. Cada uno tiene tres partes: lo que pediría el usuario, el comando exacto con sus flags y la salida esperada, para que el agente note cuando algo falla.

```markdown
## Ejemplos

**Usuario:** "¿Cuántas órdenes tuvo el cliente 4821 este mes?"

    reporte orders --user-id 4821 --from 2026-09-01 --format json

**Salida esperada:**

    {"user_id": 4821, "total_orders": 12, "total_amount": 3450.00}
```

Después documenta el camino triste como error, causa y solución:

```markdown
## Troubleshooting

**Error:** exit 2, "user not found"
**Causa:** el ID no existe en ese ambiente
**Solución:** confirmar el ID con el usuario y el --env usado
```

Que las instrucciones sean específicas. Con "Valida los datos antes de continuar" el agente se queda adivinando qué significa validar. "Corre `reporte validate --input archivo.csv`, y si falla, revisa que las fechas estén en YYYY-MM-DD y que estén los campos obligatorios" le da algo concreto que hacer. La guía de Anthropic lo resume bien: "Code is deterministic; language interpretation isn't."

### Empaquétala en SKILL.md

Un skill es una carpeta con un `SKILL.md` adentro:

```text
.claude/skills/
└── orders-report/
    ├── SKILL.md       # obligatorio
    ├── scripts/       # tu CLI o wrappers
    ├── references/    # docs bajo demanda
    └── assets/        # plantillas, schemas
```

Ponlo en `./.claude/skills` para un proyecto o en `~/.claude/skills` para tenerlo en todos. Hay detalles que confunden a la gente. El archivo se tiene que llamar exactamente `SKILL.md`, la carpeta va en kebab-case (`orders-report`, nunca `Orders Report` ni `orders_report`), y el README va en la raíz del repo, fuera de la carpeta del skill.

Esto escala gracias al progressive disclosure, porque el agente carga el skill por capas:

1. El `name` y la `description` del frontmatter siempre están cargados, que es lo justo para decidir si el skill aplica.
2. El cuerpo del `SKILL.md` se carga cuando el skill se activa. Mantenlo debajo de 5,000 palabras.
3. Los archivos de `references/` se cargan solo cuando el agente los necesita, y lo que esté en `scripts/` se ejecuta sin entrar al contexto.

Para un skill de un CLI yo siempre agrego el campo opcional `allowed-tools`. En pokecli se ve así:

```yaml
allowed-tools: Bash(pokecli:*)
```

Le dice a Claude Code que el skill puede correr comandos de `pokecli` y nada más, así que el skill también funciona como límite de seguridad. Esta forma no la inventé yo, por cierto. La copié del skill de {{< extlink href="https://github.com/microsoft/playwright-cli" >}}Playwright CLI{{< /extlink >}} de Microsoft, que mantiene el trigger pequeño, el cuerpo enfocado y el detalle extra en archivos de referencia.

## Inicio rápido con pokecli

`pokecli` es el CLI que construí para hacer la demo de todo esto. Es un CLI de Python pequeño y tipado para PokeAPI que cubre Pokémon, movimientos, habilidades, items, tipos y evoluciones, con una caché local para que las búsquedas repetidas no salgan a la red. Así lo pones a correr con el skill instalado.

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
{{< gallery-image src="images/uv-install-pokecli.webp" alt="Instalación de pokecli usando el gestor de paquetes uv." >}}
{{< gallery-image src="images/pokecli-install-skills.webp" alt="Instalación de los skills de pokecli usando el comando install." >}}
{{< /gallery >}}

`install --skills` no genera nada. El `SKILL.md` y sus archivos de referencia vienen dentro del paquete, y el comando los copia a `~/.claude/skills/pokecli/`, así que no necesitas clonar el repo. También puedes copiar los archivos a mano, agregué el comando para que el ejemplo fuera fácil de correr.

El CLI tiene doce grupos de primer nivel, entre ellos `pokemon`, `move`, `item`, `type`, `game` y `cache`. El skill no necesita todo ese inventario, solo la forma: la mayoría de los recursos soportan `get <name_or_id>` y `list`, y `pokemon` agrega comandos como `moves`, `evolution` y `encounters`.

{{< callout note >}}
El skill no reemplaza la documentación de la CLI. Le da a Claude Code un punto de entrada más pequeño y más útil hacia la misma lista de comandos.
{{< /callout >}}

Ya instalado, Claude Code sabe cuándo usar `pokecli`, qué comandos pertenecen a cada recurso y qué formato de salida pedir:

{{< gallery caption="" >}}
{{< gallery-video src="images/pokecli-skill-in-action-claude-code.webm" alt="Claude Code usando SKILL.md para interactuar con pokecli." >}}
{{< /gallery >}}

## pokecli de cerca

{{< gallery caption="Comando de ayuda de pokecli" >}}
{{< gallery-image src="images/pokecli-help.webp" alt="Windows Terminal mostrando el resultado del comando de ayuda de pokecli" >}}
{{< /gallery >}}

El `SKILL.md` del repo tiene 192 líneas, y ahí aparecen los cuatro pilares. Estas son las partes que vale la pena ver con calma.

### Frontmatter y la regla del agente

```yaml
---
name: pokecli
description: Queries Pokemon, moves, items, abilities, types, locations, game data, forms, machines, encounters, evolutions, and other PokeAPI-backed resources via the pokecli CLI. Use when the user needs Pokemon stats, move info, type matchups, catch locations, evolution chains, sprite downloads, regional or generation data, or cache management. Also use when the user mentions pokecli, pokedex, or PokeAPI.
allowed-tools: Bash(pokecli:*)
user-invocable: false
---
```

La descripción lleva el propósito de la herramienta y las frases que un usuario podría escribir, como `pokedex`, `Pokemon stats` o `download sprites`. Después el cuerpo abre con la regla que el agente debe aplicar antes que nada:

```text
## Agent rule

Use the canonical command path shown in this skill. Human aliases exist, but agents should prefer explicit commands like `pokemon get`, `move get`, and `game region get`.

If a memorized command fails, check `pokecli --help` or the subgroup help before guessing.

Always use `--format toon` for token-efficient output. This produces compact key:value output optimized for LLM context windows (~40% smaller than JSON). Only use `--format json` when the next step explicitly includes `jq` or another parser. Do not use `--format table` — it contains Rich markup that wastes tokens.
```

Cada una de esas reglas está ahí porque sin ella el agente adivinaría mal. Las dos primeras llegaron cuando pokecli sumó comandos más cortos para humanos. Si un CLI ofrece dos formas válidas de pedir lo mismo, el skill tiene que decir cuál es la de por defecto.

### Salida TOON

pokecli tiene tres formatos de salida. Las personas ven una tabla de Rich, pero su marcado consume tokens, y la puntuación de JSON también. Por eso agregué una tercera salida para agentes, TOON, una notación compacta que sale más o menos un 40% más pequeña que JSON:

```text
## TOON output format

The `--format toon` output uses Token-Optimized Object Notation:
- Single resources show as `label:` followed by indented `key: value` pairs
- Lists show as `label[count]{fields}:` followed by indented comma-separated rows
- Every response ends with `help[]` hints for next steps
- Aggregates like `count`, `total_moves`, `methods` appear as top-level keys
```

Los hints de `help[]` son mi parte favorita: `pokemon get pikachu` termina sugiriendo `pokemon moves` y `pokemon evolution`, así que la salida le enseña al agente el siguiente comando. Escribir el skill fue lo que me llevó a agregarla. En cuanto escribí una regla sobre el costo en tokens, vi que la herramienta no tenía ningún modo de salida que valiera la pena recomendar.

### Alias para humanos

{{< challenge >}}
{{< challenge-problem >}}
A los agentes les va mejor con un comando canónico y explícito por tarea, pero escribir `pokecli pokemon get pikachu` a mano cada vez es más de lo que necesita una sesión de terminal.
{{< /challenge-problem >}}
{{< challenge-decision >}}
En lugar de registrar un segundo conjunto de comandos, `commands/_group.py` define una pequeña subclase de `TyperGroup` que reescribe un primer argumento sin coincidencia a `get` antes de que Typer lo resuelva:

```python
class ResourceGroup(TyperGroup):
    """Allow `pokecli pokemon pikachu` as a shortcut for `pokecli pokemon get pikachu`."""

    def resolve_command(self, ctx: typer.Context, args: list[str]):
        if args:
            first = args[0]
            if not first.startswith("-") and first not in self.commands:
                args = ["get", *args]
        return super().resolve_command(ctx, args)
```

`pokecli pokemon pikachu` y `pokecli pokemon get pikachu` ahora ejecutan la misma función, sin ramificaciones dentro de ningún comando. El `SKILL.md` incluido sigue diciéndoles a los agentes que prefieran la forma canónica, así que el alias se queda como comodidad para humanos.
{{< /challenge-decision >}}
{{< /challenge >}}

El skill también lista las formas cortas en su propia sección, con una línea de guía: "These are fine for manual use, but agents should not default to them." Así el agente reconoce `pokecli pokemon pikachu` cuando un usuario lo escribe, y aun así manda el comando canónico.

Esta es una sesión real en Claude Code, donde pedí las estadísticas de Pikachu y luego una comparación entre Thunderbolt y Flamethrower:

{{< agent-session "pokecli-demo" >}}

{{< github repo="jebucaro/pokecli" >}}

## ¿Cuándo está listo un skill?

Cuando ya lo probaste. Hay dos cosas que probar. La primera es la activación: el skill debe cargarse con peticiones obvias y con paráfrasis, y quedarse quieto con las que no tienen relación. Apunta a un 90% con 10 a 20 frases. Para pokecli, estas deberían activarlo:

- "Busca las estadísticas de Pikachu"
- "Muéstrame datos de berries desde PokeAPI"
- "Descarga un sprite de Charizard"
- "Compara Thunderbolt y Flamethrower"

Y estas no:

- "Ayúdame a escribir una clase en Python"
- "¿Cómo está el clima hoy?"
- "Resume esta transcripción de reunión"

La segunda es el comportamiento. Corre comandos reales y revisa las salidas, los errores y los casos extremos:

```bash
pokecli pokemon get pikachu --format toon
pokecli pokemon can-learn pikachu thunderbolt
pokecli item get master-ball --format json
pokecli pokemon image 25 -o /tmp/pika.png
pokecli cache clear --resource pokemon
```

Si funcionan, los ejemplos del skill están anclados a la herramienta real. Prueba el primero en los tres formatos y vas a ver por qué la regla del agente elige `toon`.

Cuando algo no cuadra, el síntoma apunta a la solución. Si el skill no se carga, le faltan keywords a la descripción. Si se carga con peticiones que no tienen nada que ver, necesita negative triggers. Si los resultados son inconsistentes, hay que mejorar las instrucciones. Un truco útil para depurar es preguntarle al agente "¿Cuándo usarías el skill de pokecli?" y leer lo que entendió.

Antes de dar un skill por terminado, reviso esta lista:

- [ ] 2 o 3 casos de uso concretos por escrito
- [ ] Una carpeta en kebab-case con un archivo llamado exactamente `SKILL.md`
- [ ] Frontmatter entre líneas `---`, con un `name` en kebab-case
- [ ] Una `description` que dice qué y cuándo, con menos de 1024 caracteres y sin `<` ni `>`
- [ ] Instrucciones accionables, ejemplos y troubleshooting
- [ ] Archivos de referencia enlazados desde el `SKILL.md`
- [ ] Probado con peticiones obvias, paráfrasis y temas sin relación

## Tu tarea

Esta es la tarea que le dejé a la audiencia para el lunes:

1. Escoge un script que uses cada semana.
2. Saca los valores quemados a flags y agrega salida en JSON.
3. Escribe una `description` que diga qué hace y cuándo usarlo.
4. Agrega 2 o 3 ejemplos con su salida esperada.
5. Guárdalo como `SKILL.md` y pruébalo con tu agente.

Si no tienes un script a mano, usa pokecli y escribe tú el skill. Primero, quita del camino el skill incluido (puedes reinstalarlo después con `pokecli install --skills`):

```bash
rm -rf ~/.claude/skills/pokecli
```

Luego crea una carpeta limpia de proyecto con la ruta local del skill que Claude va a leer:

```bash
mkdir -p pokecli-skill-lab/.claude/skills/pokecli
cd pokecli-skill-lab
```

Dentro de esa carpeta, crea `./.claude/skills/pokecli/SKILL.md`, y luego inicia Claude desde el mismo directorio para que tome el skill local:

```bash
claude
```

No busques el archivo perfecto en el primer intento. Empieza con el frontmatter y unos cuantos comandos, prueba un prompt como "Usa pokecli para buscar las estadísticas de Pikachu", y después limpia el contexto y vuelve a intentarlo sin nombrar pokecli. Fíjate en qué se equivoca Claude: si omite un grupo de comandos, agrégalo; si usa los flags equivocados, agrega un ejemplo que funcione; si se va por comandos genéricos de shell, ajusta la descripción. Cuando te guste cómo quedó, compáralo con el que trae pokecli.

La última diapositiva de la charla decía que no te quedaste atrás, y que los scripts que ya escribiste son tu ventaja. Hazlos deterministas, dales un trigger, muéstrale el camino al agente con ejemplos y empaqueta todo en un `SKILL.md`.

---

Foto de {{< extlink href="https://unsplash.com/@jmanalog?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Jay{{< /extlink >}} en {{< extlink href="https://unsplash.com/photos/shallow-focus-photo-of-pokeball-dkFJST9zZZo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" >}}Unsplash{{< /extlink >}}

Pokémon y los nombres de los personajes de Pokémon son marcas registradas de Nintendo.
