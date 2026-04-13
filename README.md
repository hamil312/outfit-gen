# 👗 Guardarropa Virtual — Generador de Atuendos con IA

> Organiza tu ropa, combina prendas y descubre nuevos looks con ayuda de inteligencia artificial.

---

## 📌 Descripción del proyecto

**Guardarropa Virtual** es una aplicación web que transforma la manera en que organizas y usas tu ropa. Su propósito principal es ayudarte a sacar el máximo partido a tu armario, sin necesidad de ser un experto en moda.

El funcionamiento es sencillo: subes fotos de tus prendas y la aplicación las analiza automáticamente mediante visión por computadora, identificando características como el color dominante y el tipo de ocasión para la que es adecuada (formal, casual, deportiva, etc.). Con esa información, construyes tu propio **guardarropa virtual** y puedes pedirle al sistema que te proponga combinaciones de atuendos según tus preferencias del momento.

### ¿Qué puedes hacer con la app?

- **Subir y registrar tus prendas** con análisis automático de color y categoría.
- **Organizar tu guardarropa virtual** con toda tu ropa catalogada en un solo lugar.
- **Generar atuendos completos** filtrando por color, estilo u ocasión (formal, casual, deportivo, etc.).
- **Guardar tus combinaciones favoritas** para volver a usarlas cuando quieras.
- **Publicar y explorar looks** en un feed social donde otros usuarios también comparten sus atuendos.

La aplicación está pensada tanto para quienes quieren simplificar su rutina diaria de vestirse, como para quienes disfrutan explorando nuevas combinaciones con la ropa que ya tienen.

---

## ⚙️ Instrucciones de instalación

### Requisitos previos

Antes de empezar, asegúrate de tener instalado en tu equipo:

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Python](https://www.python.org/) (versión 3.9 o superior)
- Un gestor de paquetes como `npm` (incluido con Node.js)

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio
```

### 2. Configura las variables de entorno

Crea un archivo `.env` en la raíz del proyecto con tus credenciales de **Appwrite**. El archivo debe tener la siguiente estructura:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=tu_database_id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=tu_bucket_id
# Agrega aquí cualquier otra variable que tu proyecto requiera
```

> ⚠️ **Importante:** Este archivo contiene información sensible. Nunca lo subas a un repositorio público. Asegúrate de que `.env` está incluido en tu `.gitignore`.

### 3. Instala las dependencias del frontend

Desde la raíz del proyecto, ejecuta:

```bash
npm install
```

### 4. Inicia el servidor de desarrollo del frontend

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### 5. Inicia la API de Flask (servidor de visión por computadora)

La API de Flask es la encargada de analizar las imágenes de las prendas y generar las combinaciones de atuendos. Para ponerla en marcha, abre una **nueva terminal** y ejecuta los siguientes comandos:

```bash
cd server
python flaskAPI.py
```

> 💡 **Nota:** La API de Flask es necesaria únicamente para **registrar nuevas prendas** y **generar atuendos**. El resto del frontend (navegación, feed, guardarropa ya cargado) puede visualizarse de forma independiente sin necesidad de tener la API activa.

Asegúrate de tener instaladas las dependencias de Python necesarias. Si no las tienes, puedes instalarlas con:

```bash
pip install -r server/requirements.txt
```

---

## 🚀 Flujo básico de uso

A continuación se describe cómo un usuario interactúa con la aplicación desde el primer momento:

1. **Registro o inicio de sesión**
   Cuando entras a la página principal, puedes crear una cuenta nueva o iniciar sesión con tus credenciales. La autenticación está gestionada de forma segura a través de Appwrite.

2. **Acceso al guardarropa virtual**
   Una vez dentro, accedes a tu guardarropa personal, donde verás todas las prendas que hayas registrado previamente. Si es tu primera vez, estará vacío y listo para que empieces a llenarlo.

3. **Subida y registro de prendas**
   Selecciona la opción para añadir una prenda nueva y sube una foto desde tu dispositivo. La API de Flask procesará la imagen automáticamente e identificará el color dominante y el tipo de prenda, ahorrándote el esfuerzo de clasificarla manualmente.

4. **Generación de atuendos**
   Cuando quieras inspirarte, ve a la sección de generación de atuendos. Puedes filtrar por color dominante, contexto (formal, casual, deportivo) o dejar que el sistema proponga una combinación aleatoria a partir de tus prendas disponibles.

5. **Guardado de combinaciones**
   Si una combinación te gusta, puedes guardarla en tu perfil para consultarla en cualquier momento, sin tener que volver a generarla.

6. **Publicación en el feed**
   También puedes compartir tus atuendos favoritos en el feed de la aplicación, donde otros usuarios podrán ver y explorar tus looks. De la misma manera, puedes navegar por los atuendos que otros han publicado para encontrar ideas nuevas.

---

## 🧩 Casos de uso

Aquí algunos ejemplos reales de cómo distintos usuarios podrían aprovechar la aplicación:

- **La persona ocupada de lunes a viernes:** Tiene poca tiempo por las mañanas y quiere decidir qué ponerse rápido. Filtra por "formal" y el sistema le propone un atuendo listo para la oficina en segundos.

- **El estudiante universitario:** Quiere verse bien sin pensar demasiado. Sube las prendas de su armario una sola vez y luego genera looks casuales según el color que más le apetezca ese día.

- **La persona que viaja frecuentemente:** Antes de hacer una maleta, revisa su guardarropa virtual y genera combinaciones con pocas prendas para optimizar el espacio del equipaje.

- **El usuario con interés en moda:** Disfruta explorando combinaciones nuevas, guarda sus looks favoritos y los publica en el feed para compartirlos con la comunidad.

- **Alguien que recibe ropa de regalo:** Sube las prendas nuevas y descubre cómo combinarlas con lo que ya tiene, antes de llegar a la tienda a comprar algo que ya podría tener en casa.

---

## 🛠️ Resolución de problemas

### La API de Flask no arranca

- Verifica que estás dentro del directorio correcto (`cd server`) antes de ejecutar el comando.
- Asegúrate de haber instalado todas las dependencias con `pip install -r requirements.txt`.
- Confirma que tu versión de Python es 3.9 o superior con `python --version`.
- Si ves un error relacionado con PyTorch o transformers, es posible que necesites instalarlos manualmente. Consulta la documentación oficial de [PyTorch](https://pytorch.org/) para el comando correcto según tu sistema operativo.

### El frontend no se conecta con la API

- Verifica que la API de Flask está corriendo antes de intentar subir prendas o generar atuendos.
- Asegúrate de que la URL de la API configurada en el frontend apunta al puerto correcto (por defecto, Flask usa `http://localhost:5000`).

### Error al iniciar el frontend (`npm run dev`)

- Asegúrate de haber ejecutado `npm install` antes de arrancar el servidor de desarrollo.
- Verifica que el archivo `.env` existe en la raíz del proyecto y contiene todas las variables necesarias.
- Si ves errores de módulos no encontrados, intenta borrar la carpeta `node_modules` y el archivo `package-lock.json`, y vuelve a ejecutar `npm install`.

### Las imágenes no se analizan correctamente

- Comprueba que la imagen que subes es nítida y la prenda ocupa la mayor parte del encuadre.
- Los formatos recomendados son `.jpg` y `.png`.
- Si el análisis tarda demasiado, es posible que el modelo de visión se esté cargando por primera vez. La carga inicial puede demorar unos segundos extra.

### Problemas con las credenciales de Appwrite

- Verifica que el `.env` contiene los valores correctos copiados directamente desde tu consola de Appwrite.
- Asegúrate de que tu proyecto de Appwrite tiene los permisos de lectura y escritura correctamente configurados para la base de datos y el bucket de almacenamiento.

---

## 🧰 Tecnologías utilizadas

El proyecto está construido con las siguientes tecnologías y herramientas:

### Frontend
- **[Next.js](https://nextjs.org/)** — Framework de React para la interfaz de usuario, con soporte para renderizado del lado del servidor y enrutamiento integrado.
- **[Tailwind CSS](https://tailwindcss.com/)** — Librería de estilos utilitarios para construir una interfaz moderna y responsiva de forma rápida.

### Backend y autenticación
- **[Appwrite](https://appwrite.io/)** — Plataforma de backend como servicio que gestiona la autenticación de usuarios, el almacenamiento de archivos y la base de datos.

### API de visión por computadora
- **[Flask](https://flask.palletsprojects.com/)** — Microframework de Python que expone la API encargada del análisis de imágenes y la generación de atuendos.
- **[OpenCV](https://opencv.org/)** — Librería de visión por computadora utilizada para el procesamiento de imágenes.
- **[Transformers](https://huggingface.co/docs/transformers) (Hugging Face)** — Librería que permite cargar y utilizar modelos de aprendizaje automático preentrenados.
- **[PyTorch](https://pytorch.org/)** — Framework de aprendizaje profundo que sirve como motor de inferencia para los modelos.
- **[scikit-learn](https://scikit-learn.org/)** — Librería de machine learning utilizada para tareas de clasificación y procesamiento de características.

### Modelo de IA para moda

El análisis y clasificación de prendas utiliza el modelo **`patrickjohncyh/fashion-clip`**, disponible públicamente en [Hugging Face](https://huggingface.co/patrickjohncyh/fashion-clip).

> **Crédito del modelo:**
> Este proyecto utiliza el modelo `fashion-clip` desarrollado por [@patrickjohncyh](https://huggingface.co/patrickjohncyh), distribuido bajo licencia **MIT**. El modelo puede consultarse y descargarse libremente desde su página oficial en Hugging Face:
> 👉 [https://huggingface.co/patrickjohncyh/fashion-clip](https://huggingface.co/patrickjohncyh/fashion-clip)
>
> ```
> Model: patrickjohncyh/fashion-clip
> Source: https://huggingface.co/patrickjohncyh/fashion-clip
> License: MIT
> ```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
