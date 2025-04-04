# APP Punts d'Interès 

Esta aplicación web permite gestionar puntos de interés de diferentes ciudades, mostrarlos en un listado y visualizarlos en un mapa interactivo. Los datos se cargan mediante archivos CSV y se complementan con información de países obtenida de una API REST.

Archivos del Proyecto
## `index.html`


Es el archivo principal que define la estructura HTML de la aplicación. Contiene los elementos de la interfaz de usuario como filtros, zona de arrastre para archivos, listado de puntos de interés y el mapa.

# Funcionalidades principales:

Define la estructura básica de la página

Incluye las referencias a los archivos CSS y JavaScript necesarios

Contiene los elementos de la interfaz de usuario


## `styles.css`

Archivo de estilos CSS que define el diseño y la apariencia visual de la aplicación.

# Características principales:

Estilos responsivos para diferentes tamaños de pantalla

Diseño de los elementos de filtrado

Apariencia de los puntos de interés en el listado

Estilos para el mapa y la zona de arrastre de archivos

## `classes.js`

Contiene las clases principales que definen la estructura de datos y la lógica de negocio de la aplicación.

# Clases principales:

PuntInteres: Clase base para los puntos de interés

Atraccio: Clase que hereda de PuntInteres para atracciones turísticas

Museu: Clase que hereda de PuntInteres para museos

Excel: Clase utilitaria para leer CSV y obtener información de países

# Métodos importantes:

preuIva(): Calcula el precio con IVA según el país

readCSV(): Lee y procesa archivos CSV

getInfoCountry(): Obtiene información de países desde API REST

## `app.js`

Contiene la clase App que gestiona toda la lógica de la aplicación y la interacción con la interfaz de usuario.

# Funcionalidades principales:

Inicialización del mapa (usando Leaflet)

Gestión de eventos (drag and drop, filtros, botones)

Carga y procesamiento de archivos CSV

Visualización de puntos en el mapa y listado

Filtrado y ordenación de datos

Integración con la API de geolocalización