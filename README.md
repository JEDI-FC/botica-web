# Botica Web

Sistema web para la gestion de inventario, ventas, clientes, proveedores y reportes de una botica. El proyecto esta organizado como una aplicacion full stack con API REST en Node.js/Express y frontend en React con Vite.

## Caracteristicas

- Gestion de productos, categorias y proveedores.
- Control de stock y alertas de bajo inventario.
- Registro y anulacion de ventas con actualizacion automatica de stock.
- Gestion de clientes y usuarios.
- Autenticacion con JWT.
- Notificaciones por usuario.
- Reporte general para seguimiento del negocio.

## Tecnologias

- Backend: Node.js, Express, MySQL, mysql2, JWT, bcryptjs, dotenv.
- Frontend: React, Vite, CSS.
- Base de datos: MySQL.

## Estructura

```txt
botica-web/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- app.js
|   |   `-- server.js
|   |-- sql/
|   |-- .env.example
|   `-- package.json
`-- frontend/
    |-- src/
    |   |-- components/
    |   |-- pages/
    |   |-- services/
    |   |-- App.jsx
    |   `-- main.jsx
    |-- .env.example
    `-- package.json
```

## Requisitos

- Node.js 18 o superior.
- npm.
- MySQL.
- Git.
- Docker y Docker Compose, si se ejecuta con contenedores.

## Clonar el proyecto

Clonar el repositorio y entrar al directorio:

```bash
git clone https://github.com/JEDI-FC/botica-web.git
cd botica-web
```

Reemplazar `URL_DEL_REPOSITORIO` por la URL HTTPS o SSH del repositorio en GitHub. Despues de clonar, se puede ejecutar con Docker o configurar backend y frontend manualmente.

## Configuracion

### Docker

Copiar el archivo de variables para Docker:

```bash
cp .env.docker.example .env
```

Levantar la aplicacion completa:

```bash
docker compose up --build
```

Servicios disponibles:

```txt
Frontend: http://localhost:8080
Backend:  http://localhost:3000
MySQL:    localhost:3307
Health backend:  http://localhost:3000/api/health
Health frontend: http://localhost:8080/health
```

Nota: Docker Desktop debe estar iniciado antes de ejecutar `docker compose up --build`.

El contenedor de MySQL importa automaticamente los scripts SQL dentro de:

```txt
backend/sql/
```

Actualmente se incluyen el esquema principal y tablas adicionales como notificaciones.

Para reiniciar la base de datos desde cero:

```bash
docker compose down -v
docker compose up --build
```

Para revisar el estado de los contenedores:

```bash
docker compose ps
```

Para ver logs:

```bash
docker compose logs -f
```

### Backend

Crear `backend/.env` a partir de `backend/.env.example`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=botica_nova_salud

JWT_SECRET=clave_secreta_segura
```

Instalar dependencias y levantar el servidor:

```bash
cd backend
npm install
npm run dev
```

La API queda disponible en:

```txt
http://localhost:3000/api
```

### Frontend

Crear `frontend/.env` a partir de `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

Instalar dependencias y levantar Vite:

```bash
cd frontend
npm install
npm run dev
```

La aplicacion queda disponible en:

```txt
http://localhost:5173
```

## Base de datos

Importar en MySQL el script principal:

```txt
backend/sql/botica_nova_salud.sql
```

## Scripts

Backend:

```bash
npm run dev
npm start
```

Frontend:

```bash
npm run dev
npm run build
npm run preview
```

## Rutas principales de la API

```txt
/api/usuarios
/api/productos
/api/categorias
/api/proveedores
/api/clientes
/api/ventas
/api/notificaciones
/api/reportes
```

## Autenticacion

El login se realiza en:

```txt
POST /api/usuarios/login
```

Las rutas protegidas usan el token JWT en el header:

```txt
Authorization: Bearer TU_TOKEN
```

## Notas para desarrollo

- No subir archivos `.env` al repositorio.
- No versionar `node_modules/` ni builds generados como `dist/`.
- Mantener actualizados los archivos `.env.example` cuando cambien las variables requeridas.
