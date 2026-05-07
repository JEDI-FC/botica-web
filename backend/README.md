# Botica Nova Salud

Sistema web para la gestion de inventario, ventas y atencion al cliente de una botica. El proyecto esta dividido en un backend con API REST y un frontend en React.

## Objetivo

Centralizar el control de productos, categorias, proveedores, clientes y ventas. El sistema permite registrar productos, controlar stock, generar alertas de bajo stock, registrar ventas y descontar inventario automaticamente.

Tambien incluye administracion de clientes, notificaciones por usuario, reportes gerenciales y gestion de perfil del usuario autenticado.

Modulos del frontend:

- Dashboard
- Inventario
- Ventas
- Clientes
- Notificaciones
- Reportes
- Mi perfil

## Tecnologias

Backend:

- Node.js
- Express
- MySQL
- mysql2
- JWT
- bcryptjs
- dotenv

Frontend:

- React
- Vite
- CSS

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
|   |-- .env
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

## Base de datos

Importar en MySQL el archivo:

```txt
backend/sql/botica_nova_salud.sql
```

Base de datos esperada:

```txt
botica_nova_salud
```

Tablas principales:

- `productos`
- `categorias`
- `proveedores`
- `clientes`
- `usuarios`
- `ventas`
- `detalle_ventas`
- `notificaciones`

## Configuracion del backend

Crear `backend/.env` usando como referencia `backend/.env.example`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=botica_nova_salud

JWT_SECRET=clave_secreta_botica
```

Instalar dependencias:

```bash
cd backend
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Ejecutar en produccion:

```bash
npm start
```

URL del backend:

```txt
http://localhost:3000
```

Nota: la ruta raiz del backend redirige al frontend configurado en `FRONTEND_URL`.

## Configuracion del frontend

Crear `frontend/.env` usando como referencia `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

Instalar dependencias:

```bash
cd frontend
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

URL del frontend:

```txt
http://localhost:5173
```

Compilar:

```bash
npm run build
```

## Autenticacion

El sistema usa JWT. Las rutas de consulta son publicas, pero las rutas que registran, actualizan, eliminan o anulan datos requieren token.

Roles principales:

- `admin`: puede administrar usuarios y operar todos los modulos.
- `vendedor`: puede operar inventario, ventas, clientes, notificaciones y reportes, pero no puede crear usuarios.

Login:

```txt
POST /api/usuarios/login
```

Body:

```json
{
  "usuario": "codex_test",
  "password": "123456"
}
```

Header para rutas protegidas:

```txt
Authorization: Bearer TU_TOKEN
```

Si la tabla `usuarios` esta vacia, se puede crear el primer usuario sin token:

```txt
POST /api/usuarios
```

Despues del primer usuario, solo un usuario con rol `admin` puede crear nuevos usuarios.

## Rutas API

Base URL:

```txt
http://localhost:3000/api
```

### Usuarios

```txt
POST /usuarios/login
GET  /usuarios/perfil
PUT  /usuarios/perfil
GET  /usuarios
POST /usuarios
```

### Notificaciones

```txt
GET    /notificaciones
GET    /notificaciones?id_usuario=1
POST   /notificaciones
PATCH  /notificaciones/:id/estado
DELETE /notificaciones/:id
```

Las notificaciones permiten asignar mensajes a usuarios especificos. Se pueden filtrar por usuario, marcar como leidas o no leidas y eliminar.

### Productos

```txt
GET    /productos
GET    /productos/alertas/bajo-stock
GET    /productos/:id
POST   /productos
PUT    /productos/:id
DELETE /productos/:id
```

El `DELETE` de productos realiza borrado logico:

```txt
estado = 'inactivo'
```

### Categorias

```txt
GET    /categorias
GET    /categorias/:id
POST   /categorias
PUT    /categorias/:id
DELETE /categorias/:id
```

### Proveedores

```txt
GET    /proveedores
GET    /proveedores/:id
POST   /proveedores
PUT    /proveedores/:id
DELETE /proveedores/:id
```

### Clientes

```txt
GET    /clientes
GET    /clientes/buscar?q=texto
GET    /clientes/:id
POST   /clientes
PUT    /clientes/:id
DELETE /clientes/:id
```

### Ventas

```txt
GET   /ventas
GET   /ventas/:id
POST  /ventas
PATCH /ventas/:id/anular
```

### Reportes

```txt
GET /reportes/general
```

Devuelve resumen de productos, clientes, ventas, monto vendido, productos bajo stock, ventas recientes y productos mas vendidos.

Al registrar una venta:

- Se valida el usuario.
- Se validan los productos.
- Se verifica stock disponible.
- Se calcula el total desde `precio_venta`.
- Se registra la venta.
- Se registra el detalle de venta.
- Se descuenta stock automaticamente.
- Si el stock queda bajo el minimo, se genera una notificacion de reposicion.

Al anular una venta:

- Cambia el estado a `anulada`.
- Devuelve el stock de los productos vendidos.

## Ejemplos

Crear producto:

```json
{
  "nombre": "Paracetamol 500mg",
  "descripcion": "Caja por 100 tabletas",
  "codigo_barra": "775000000001",
  "precio_compra": 3.5,
  "precio_venta": 5,
  "stock": 20,
  "stock_minimo": 5,
  "fecha_vencimiento": "2026-12-31",
  "id_categoria": 1,
  "id_proveedor": 1
}
```

Registrar venta:

```json
{
  "id_cliente": null,
  "id_usuario": 1,
  "metodo_pago": "efectivo",
  "detalles": [
    {
      "id_producto": 1,
      "cantidad": 2
    }
  ]
}
```

## Flujo principal probado

Flujo requerido:

```txt
Producto registrado -> Venta realizada -> Stock descontado -> Alerta si queda bajo stock
```

Resultado de prueba:

```json
{
  "StockInicial": 6,
  "CantidadVendida": 2,
  "StockFinal": 4,
  "StockMinimo": 5,
  "ApareceEnBajoStock": true
}
```

## Funcionamiento del sistema

El administrador o vendedor inicia sesion desde el frontend. Luego puede gestionar productos, categorias y proveedores. Cuando se registra una venta, el backend valida que exista stock suficiente y descuenta la cantidad vendida. Si el stock final queda igual o por debajo del stock minimo, el producto aparece en la alerta de reposicion.

El frontend consume la API mediante `frontend/src/services/api.js`, donde se agrega automaticamente el token JWT guardado en `localStorage`.
