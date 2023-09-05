---
title: "Almacenar Imágenes en SQL Server"
date: 2015-09-23T08:19:33-06:00
image: "/blog/almacenar-imagenes-en-sql-server/images/cover.webp"
tags: [net, csharp, mssql]
draft: false
description: "Aprende el concepto de cómo guardar una imagen en una base de datos MS SQL Server y posteriormente acceder a su contenido usando C#."
---
Existe un gran debate sobre si es correcto o no almacenar imágenes en una base de datos. Puedes consultar alguno de los siguientes artículos como referencia antes de tomar tu decisión.

+ <a href="https://stackoverflow.com/questions/5613898/storing-images-in-sql-server" target="_blank" rel="nofollow"> Storing images in sql server ➡</a>
+ <a href="https://www.microsoft.com/en-us/research/publication/to-blob-or-not-to-blob-large-object-storage-in-a-database-or-a-filesystem/?from=https://research.microsoft.com/apps/pubs/default.aspx?id=64525&type=exact" target="_blank" rel="nofollow">To Blob or not to blog ➡</a>

Los artículos explican que que si los objetos son de promedio mayores a un megabyte, NTFS tiene una clara ventaja sobre MS SQL Server. Es decir, es preferible guardarlo en disco que en base de datos. Si los objetos son de menos de 256 kilobytes, la base de datos tiene una clara ventaja. Dentro de este rango, depende de cuán intensa sea la carga de escritura y el tiempo de almacenamiento de una réplica típica en el sistema.

La mejor forma de expresarlo es la siguiente frase en latín:

> Necessitas caret lege

Sugiere que cuando una persona está en una situación desesperada, puede estar dispuesta a hacer lo que sea necesario para encontrar una solución.

Sea que tu necesidad sea de trabajo o de curiosidad, puedes tomar esta publicación como referencia.

## ⚠️ Consideraciones

El ejemplo es bastante sencillo, está codificado en .NET Framework 4.8 utilizando ADO.NET con SQLClient. Se tendrá una opción para poder guardar la imagen y otra para poder recuperar el contenido desde la base de datos por medio del Id el cual será generado automáticamente por la base de datos.

Consideralo como un ejemplo básico y funcional para demostrar un concepto 😉.

## 📜 Base de Datos
El siguiente script creará una base de datos en MSSQL Server llamada `Samples` y dentro de la base, una tabla llamada `Notes`. Se utilizará principalmente un campo autonumérico para el Id y un campo del tipo varbinary para contener la imagen.

```t-sql
USE master
GO

CREATE DATABASE Samples
GO

USE Samples
GO

CREATE TABLE Notes (
     Id int IDENTITY (1, 1) NOT NULL
    ,Title varchar(50) NOT NULL
    ,ImageData varbinary(MAX) NOT NULL
)
```

## Código

### 💾 Guardar la Imagen

El código inicia con la lectura del archivo de la imagen por medio de `File.ReadAllBytes` y su almacenamiento en una variable tipo arreglo de bytes. Posteriormente ejecuta un comando SQL en donde se utilizará la data de la variable tipo arreglo de bytes como parámetro para el construir el script de inserción.

``` c#
byte[] data = File.ReadAllBytes(TxtPath.Text);
string qry = "insert into Notes (Title, ImageData) values (@prTitle, @prImageData)";

try
{
    using (SqlCommand sqlCommand = new SqlCommand(qry, con))
    {
        sqlCommand.Parameters.Add(new SqlParameter("@prTitle", TxtTitle.Text));
        sqlCommand.Parameters.Add(new SqlParameter("@prImageData", data));

        con.Open();
        sqlCommand.ExecuteNonQuery();
    }

    MessageBox.Show("Success", "Save", MessageBoxButtons.OK, MessageBoxIcon.Information);
}
catch (Exception ex)
{
    MessageBox.Show(ex.Message);
}
finally
{
    if (con.State == ConnectionState.Open)
        con.Close();
}
```

### 🔍 Consultar la Imagen

Para obtener la imagen, primero realiza la consulta a la base de datos utilizando un valor como `Id`. De encontrar el registro, traslada la data de la base de datos a una variable tipo arreglo de bytes, la imagen será extraída del arreglo de bytes por medio de un `MemoryStream`.

``` c#
string qry = "select Title, ImageData from Notes where Id = @prId";
try
{
    using (SqlCommand sqlCommand = new SqlCommand(qry, con))
    {
        sqlCommand.Parameters.Add(new SqlParameter("@prId", NudId.Value));

        con.Open();

        using (SqlDataReader sqlDataReader = sqlCommand.ExecuteReader())
        {
            if (sqlDataReader.Read())
            {
                LblTitle.Text = sqlDataReader.GetString(0);
                byte[] imgData = (byte[])sqlDataReader.GetValue(1);

                using (MemoryStream ms = new MemoryStream(imgData, 0, imgData.Length))
                {
                    pictureBox2.Image = Image.FromStream(ms, true);
                }
            }
            else
            {
                MessageBox.Show($"Id { NudId.Value.ToString() } does not exists", "View", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
            }
        }
    }
}
catch(Exception ex)
{
    MessageBox.Show(ex.Message);
}
finally
{
    if (con.State == ConnectionState.Open)
        con.Close();
}       
```

### ⛳ Ejemplo
He preparado un pequeño ejemplo que puedes acceder en GitHub con el código necesario para guardar y consultar una imagen en una base de datos SQL Server.

<a href="https://github.com/jebucaro/csharp-guardar-imagen-base-de-datos.git" target="_blank">Descargar Ejemplo  ➡</a>

---
Foto de <a href="https://unsplash.com/es/@neom?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">NEOM</a> en <a href="https://unsplash.com/es/fotos/SUIMrEKVOXc?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="nofollow, noreferrer">Unsplash</a>
  