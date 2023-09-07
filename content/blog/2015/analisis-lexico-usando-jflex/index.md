---
title: "Análisis Léxico usando JFlex"
date: 2015-04-26T17:37:28-06:00
image: "/blog/analisis-lexico-usando-jflex/images/cover.webp"
tags: [java]
draft: false
description: "Aprende a usar JFlex, con este sencillo ejemplo. Descubre cómo definir expresiones regulares y tokens personalizados."
---
Cuando era estudiante de la Universidad en un semestre tenía asignado una tarea sobre el Análisis Léxico, necesitaba un ejemplo en donde se pudiera apreciar la parte de análisis léxico sin incluir la parte correspondiente al análisis sintáctico.

## 📌 Requisitos
Para proceder es necesario tener Java y <a href="/blog/guia-para-instalar-jflex">JFlex instalado y configurado ➡</a> adecuadamente.

## 🤖 Código
### CustomYytoken
La clase CustomYytoken será utilizada para obtener diversos datos que devolverá el análisis léxico. Adicionalmente se concatenarán los valores de los campos de la clase para la divulgación del contenido.

```java
class CustomYytoken {

  public int counter;
  public String text;
  public String keyword;
  public int lineNumber;
  public long charNumber;

  public CustomYytoken(int counter, String text, String keyword, int lineNumber, long charNumber) {
      this.counter = counter;
      this.text = text;
      this.keyword = keyword;
      this.lineNumber = lineNumber;
      this.charNumber = charNumber;
  }

  public String toString() {
      return "Counter: " + this.counter + " Text: " + this.text + " Keyword: " + this.keyword + " LineNumber: " + this.lineNumber + " CharNumber: " + this.charNumber;
  }
}
```

### CustomLexer
El archivo `CustomLexer.jflex` contendrá la estructura de un archivo JFlex en donde se establecerán las reglas del Análisis Léxico. Se detallarán las expresiones regulares de los tokens que se deseen reconocer, así como lo que sucederá al reconocerlos.


```java
%%
%public
%class CustomLexer
%{
    private int counter;
%}

%type CustomYytoken

%init{
    counter = 0;
%init}

%eof{
%eof}

%line

%char

/* Regular expresions */

    DIGIT = [0-9]
    NUMBER = {DIGIT} {DIGIT}*
    LETTER = [A-Za-z]
    WORD = {LETTER} {LETTER}*
    SYMBOL = "*"|"+"|"-"|"/"|"#"
    SPACE = " "
    NEWLINE = \n|\r|\r\n

%%

{NUMBER} {
    counter++;
    return new CustomYytoken(counter, yytext(), "NUMBER", yyline, yychar);
}
 
{WORD} {
    counter++;
    return new CustomYytoken(counter, yytext(), "WORD", yyline, yychar);
}
 
{SYMBOL} {
    counter++;
    return new CustomYytoken(counter, yytext(), "SYMBOL", yyline, yychar);
}
 
{SPACE} {
    // Ignore when it's a space
}
 
{NEWLINE} {
    counter++;
    return new CustomYytoken(counter, " ", "NEWLINE", yyline, yychar);
}
```

Despues de guardar, abre una terminal y utilizando el comando `jflex`, procesa el archivo `CustomLexer.jflex`

```
jflex .\CustomLexer.jflex
```

Obtendrás un resultado similar al siguiente:

```
Reading ".\CustomLexer.jflex"
Constructing NFA : 42 states in NFA
Converting NFA to DFA :
.............
15 states before minimization, 7 states in minimized DFA
Writing code to ".\CustomLexer.java"
```

### test.txt
Crea un archivo de prueba con nombre `test.txt` en el mismo directorio que los otros archivos con el siguiente contenido.

```
1777*
#*1
*#06#
a123
12345
This is an
example
on how to
use
JFlex
```

### Main
Por último necesitamos un archivo de java para la implementación del código anterior. En este archivo se hará uso de las clases `CustomYytoken` y `CustomLexer`.

```java
import java.io.BufferedReader;
import java.io.FileReader;
 
public class Main {
 
  public static void main(String[] args) {

    try {

      String fileName = "jflex_test.txt";

      BufferedReader buffer = new BufferedReader(new FileReader(fileName));
      CustomLexer customLexer = new CustomLexer(buffer);

      while(true) {

        CustomYytoken token = customLexer.yylex();

        if (token == null)
          break;

        System.out.println(token.toString());
      }
    }
    catch (Exception e) {
      System.out.println(e.toString());
    }
  }
}
```

Procede a compilar el código con el siguiente comando. Si todo se encuentra bien, no devolverá resultado alguno.

```
javac .\Main.java
```

Una vez compilado puedes ejecutar el código con el siguiente comando.

```
java Main
```

Te devolverá un resultado similar al siguiente:
```
Counter: 1 Text: 1777 Keyword: NUMBER LineNumber: 0 CharNumber: 0
Counter: 2 Text: * Keyword: SYMBOL LineNumber: 0 CharNumber: 4
Counter: 3 Text:   Keyword: NEWLINE LineNumber: 0 CharNumber: 5
Counter: 4 Text: # Keyword: SYMBOL LineNumber: 1 CharNumber: 7
Counter: 5 Text: * Keyword: SYMBOL LineNumber: 1 CharNumber: 8
Counter: 6 Text: 1 Keyword: NUMBER LineNumber: 1 CharNumber: 9
Counter: 7 Text:   Keyword: NEWLINE LineNumber: 1 CharNumber: 10
Counter: 8 Text: * Keyword: SYMBOL LineNumber: 2 CharNumber: 12
Counter: 9 Text: # Keyword: SYMBOL LineNumber: 2 CharNumber: 13
Counter: 10 Text: 06 Keyword: NUMBER LineNumber: 2 CharNumber: 14
Counter: 11 Text: # Keyword: SYMBOL LineNumber: 2 CharNumber: 16
Counter: 12 Text:   Keyword: NEWLINE LineNumber: 2 CharNumber: 17
Counter: 13 Text: a Keyword: WORD LineNumber: 3 CharNumber: 19
Counter: 14 Text: 123 Keyword: NUMBER LineNumber: 3 CharNumber: 20
Counter: 15 Text:   Keyword: NEWLINE LineNumber: 3 CharNumber: 23
Counter: 16 Text: 12345 Keyword: NUMBER LineNumber: 4 CharNumber: 25
Counter: 17 Text:   Keyword: NEWLINE LineNumber: 4 CharNumber: 30
Counter: 18 Text: This Keyword: WORD LineNumber: 5 CharNumber: 32
Counter: 19 Text: is Keyword: WORD LineNumber: 5 CharNumber: 37
Counter: 20 Text: an Keyword: WORD LineNumber: 5 CharNumber: 40
Counter: 21 Text:   Keyword: NEWLINE LineNumber: 5 CharNumber: 42
Counter: 22 Text: example Keyword: WORD LineNumber: 6 CharNumber: 44
Counter: 23 Text:   Keyword: NEWLINE LineNumber: 6 CharNumber: 51
Counter: 24 Text: on Keyword: WORD LineNumber: 7 CharNumber: 53
Counter: 25 Text: how Keyword: WORD LineNumber: 7 CharNumber: 56
Counter: 26 Text: to Keyword: WORD LineNumber: 7 CharNumber: 60
Counter: 27 Text:   Keyword: NEWLINE LineNumber: 7 CharNumber: 62
Counter: 28 Text: use Keyword: WORD LineNumber: 8 CharNumber: 64
Counter: 29 Text:   Keyword: NEWLINE LineNumber: 8 CharNumber: 67
Counter: 30 Text: JFlex Keyword: WORD LineNumber: 9 CharNumber: 69
```

El código anterior fue probado con las siguientes versiones de Java y JFlex.
```
java 19.0.1 2022-10-18
Java(TM) SE Runtime Environment (build 19.0.1+10-21)
Java HotSpot(TM) 64-Bit Server VM (build 19.0.1+10-21, mixed mode, sharing)
```

```
This is JFlex 1.8.2
```

De esta forma se ha logrado mostrar el funcionamiento de un analizador léxico creado usando JFlex.

---
Foto de <a href="https://unsplash.com/es/@egorghetto?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Eduardo Gorghetto</a> en <a href="https://unsplash.com/es/fotos/vJ3KldG86Eo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
  