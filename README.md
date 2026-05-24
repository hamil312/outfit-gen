# Guardarropa Virtual — Generador de Atuendos

> Organiza tu ropa, combina prendas y descubre nuevos looks.

---

## 📌 Descripción del proyecto

**Guardarropa Virtual** es una aplicación web que busca asistir en la organización y el uso de la ropa. Su propósito principal es ayudar a sacar el máximo partido al armario del usuario, sin necesidad de ser un experto en moda.

El funcionamiento es sencillo: subir fotos de las prendas y la aplicación las analiza automáticamente mediante visión por computadora, identificando características como el color dominante y el tipo de ocasión para la que es adecuada (formal, casual, deportiva, etc.). Con esa información, se construye el **guardarropa virtual** y se puede pedirle al sistema que te proponga combinaciones de atuendos según preferencias del momento.

### ¿Qué se puede hacer con la app?

- **Subir y registrar las prendas** con análisis automático de color y categoría.
- **Organizar guardarropa virtual** con toda la ropa catalogada en un solo lugar.
- **Generar atuendos completos** filtrando por color, estilo u ocasión (formal, casual, deportivo, etc.).
- **Guardar combinaciones favoritas** para volver a usarlas.
- **Publicar y explorar looks** en un feed social donde otros usuarios también comparten sus atuendos.

La aplicación está pensada tanto para quienes quieren simplificar su rutina diaria de vestirse, como para quienes disfrutan explorando nuevas combinaciones con la ropa que ya tienen.

---

## ⚙️ Instrucciones de instalación

### Requisitos previos

Antes de empezar, asegurarse de tener instalado en el equipo:

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- [Python](https://www.python.org/)
- Un gestor de paquetes como `npm` (incluido con Node.js)

### 1. Clonar el repositorio

```bash
git clone https://github.com/hamil312/outfit-gen
cd outfit-gen
```

### 2. Configurar las variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las credenciales de **Appwrite**. El archivo debe tener la siguiente estructura:

```env
NEXT_PUBLIC_APPWRITE_PROJECT_ID = ""
NEXT_PUBLIC_APPWRITE_PROJECT_NAME = ""
NEXT_PUBLIC_APPWRITE_ENDPOINT = ""
NEXT_PUBLIC_APPWRITE_DATABASE_ID = ""
NEXT_PUBLIC_APPWRITE_BUCKET_ID = ""
NEXT_PUBLIC_APPWRITE_CLOTHING_COLLECTION_ID = ""
NEXT_PUBLIC_APPWRITE_OUTFITS_COLLECTION_ID = ""
NEXT_PUBLIC_APPWRITE_FAVOURITES_COLLECTION_ID = ""
```

### 3. Instalar las dependencias del frontend

Desde la raíz del proyecto, ejecutar:

```bash
npm install
```

### 4. Iniciar el servidor de desarrollo del frontend

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### 5. Iniciar la API de Flask (servidor de visión por computadora)

La API de Flask es la encargada de analizar las imágenes de las prendas y generar las combinaciones de atuendos. Para ponerla en marcha, abrir una **nueva terminal** y ejecutar los siguientes comandos:

```bash
cd server
python flaskAPI.py
```

> 💡 **Nota:** La API de Flask es necesaria únicamente para **registrar nuevas prendas** y **generar atuendos**. El resto del frontend (navegación, feed, guardarropa ya cargado) puede visualizarse de forma independiente sin necesidad de tener la API activa.

Tener instaladas las dependencias de Python necesarias
---

## 🚀 Flujo básico de uso

A continuación se describe cómo un usuario interactúa con la aplicación desde el primer momento:

1. **Registro o inicio de sesión**
   Al entrar a la página principal, se puede crear una cuenta nueva o iniciar sesión con las credenciales. La autenticación está gestionada de forma segura a través de Appwrite.
   <img width="1920" height="927" alt="image" src="https://github.com/user-attachments/assets/0fe1d965-14b1-46e9-912e-75248dde908e" />
   <img width="1920" height="926" alt="image" src="https://github.com/user-attachments/assets/7fd9a21a-46ea-4b86-a646-3ad99ed45057" />

3. **Acceso al guardarropa virtual**
   Una vez dentro, se puede acceder al guardarropa personal, donde estarán todas las prendas que haya registrado previamente. Si es la primera vez, estará vacío.
   <img width="1920" height="923" alt="image" src="https://github.com/user-attachments/assets/f654b1ab-9d0b-4113-94f6-fbea675d9fc2" />

5. **Subida y registro de prendas**
   Seleccionar la opción para añadir una prenda nueva y subir una foto desde tu dispositivo. La API de Flask procesará la imagen automáticamente e identificará el color dominante y el tipo de prenda.
   <img width="1920" height="925" alt="image" src="https://github.com/user-attachments/assets/9a581000-d771-486a-8b0d-c3731dc17e67" />

7. **Generación de atuendos**
   Para generar atuendos, ir a la sección de generación de atuendos. Se puede filtrar por color dominante, contexto (formal, casual, deportivo) o dejar que el sistema proponga una combinación aleatoria a partir de las prendas disponibles.
   <img width="1920" height="928" alt="image" src="https://github.com/user-attachments/assets/07514928-0a6f-4d1e-9568-cb389bb8e771" />

9. **Guardado de combinaciones**
   Se puede guardar atuendos en el perfil para consultarlos en cualquier momento, sin tener que volver a generarlos.
   <img width="1920" height="923" alt="image" src="https://github.com/user-attachments/assets/85feb624-e255-4e1b-b087-f9e2fe068e5c" />

11. **Publicación en el feed**
   También es posible compartir atuendos favoritos en el feed de la aplicación, donde otros usuarios podrán ver y explorar los atuendos generados por el usuario. De la misma manera, el usuario puede navegar por los atuendos que otros han publicado para encontrar ideas nuevas.
   <img width="1920" height="929" alt="image" src="https://github.com/user-attachments/assets/572ba071-a1d5-49a3-b335-e5260d3d5a38" />

---

## 🛠️ Resolución de problemas

### La API de Flask no arranca

- Verificar que se esta dentro del directorio correcto (`cd server`) antes de ejecutar el comando.
- Instalar las librerias correspondientes de python.
- Si hay un error relacionado con PyTorch o transformers, es posible que sea necesario instalarlos manualmente. Consultar la documentación oficial de [PyTorch](https://pytorch.org/) para el comando correcto según sistema operativo.

### El frontend no se conecta con la API

- Verificar que la API de Flask está corriendo antes de intentar subir prendas o generar atuendos.
- Asegúrarse de que la URL de la API configurada en el frontend apunta al puerto correcto (por defecto, Flask usa `http://localhost:5000`).

### Error al iniciar el frontend (`npm run dev`)

- Asegurarse de haber ejecutado `npm install` antes de arrancar el servidor de desarrollo.
- Verificar que el archivo `.env` existe en la raíz del proyecto y contiene todas las variables necesarias.
- Si hay errores de módulos no encontrados, intentar borrar la carpeta `node_modules` y el archivo `package-lock.json`, y volver a ejecutar `npm install`.

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
