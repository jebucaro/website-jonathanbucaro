---
translationKey: '2022-get-previous-working-date-python'
title: 'Obten la fecha laboral inmediata anterior en Python'
date: 2022-07-19T15:14:18-06:00
image: '/images/blog/2022/get-previous-working-date-python/cover.webp'
tags: [python]
draft: false
description: 'La fecha laboral inmediata anterior corresponde al día laboral que precede al día actual. Aprende como realizar este cálculo en Python.'
---

Frecuentemente me he topado con la necesidad de realizar este cálculo, en donde ejemplo el día laboral que precede al día lunes 2022-06-13 corresponde al día viernes 2022-06-10.

Iniciamos a partir de un objeto `datetime` del módulo `datetime` que contendrá los datos de la fecha actual. El método estrella en esta ocasión es `datetime.weekday()`, el cual retornará una representación numérica del día de la semana al que corresponde la fecha en un rango de [0-6].

<div class="table-container">
  <table>
    <tr><th>Valor</th><th>Día</th></tr>
    <tr><td>0</td><td>Lunes</td></tr>
    <tr><td>1</td><td>Martes</td></tr>
    <tr><td>2</td><td>Miércoles</td></tr>
    <tr><td>3</td><td>Jueves</td></tr>
    <tr><td>4</td><td>Viernes</td></tr>
    <tr><td>5</td><td>Sábado</td></tr>
    <tr><td>6</td><td>Domingo</td></tr>
  </table>
</div>

Ahora la idea principal consiste en que si la fecha corresponde al día lunes, este debe regresar tres días, el domingo dos días y el resto se debe regresar un día.

```python
from datetime import datetime, timedelta

lastBusinessDay = datetime.today()
shift = timedelta(max(1, (lastBusinessDay.weekday() + 6) % 7 - 3))
lastBusinessDay = lastBusinessDay - shift
```

En cuanto a los asuetos o feriados, por el momento he decidido crear una lista de fechas, en la que si el día anterior es un asueto, volveré a generar un día anterior de forma recursiva.

---

Foto de <a href="https://unsplash.com/es/@mariogogh?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Mario Gogh</a> en <a href="https://unsplash.com/es/fotos/VBLHICVh-lI?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
