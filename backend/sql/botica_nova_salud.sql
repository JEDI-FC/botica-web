CREATE DATABASE IF NOT EXISTS botica_nova_salud
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE botica_nova_salud;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  usuario VARCHAR(60) NOT NULL,
  correo VARCHAR(120) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'vendedor') NOT NULL DEFAULT 'vendedor',
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_usuario (usuario),
  UNIQUE KEY uq_usuarios_correo (correo)
);

CREATE TABLE categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_categoria),
  KEY idx_categorias_estado (estado)
);

CREATE TABLE proveedores (
  id_proveedor INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  ruc VARCHAR(20) DEFAULT NULL,
  telefono VARCHAR(30) DEFAULT NULL,
  correo VARCHAR(120) DEFAULT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_proveedor),
  UNIQUE KEY uq_proveedores_ruc (ruc),
  KEY idx_proveedores_estado (estado)
);

CREATE TABLE clientes (
  id_cliente INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  dni VARCHAR(20) DEFAULT NULL,
  telefono VARCHAR(30) DEFAULT NULL,
  correo VARCHAR(120) DEFAULT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cliente),
  UNIQUE KEY uq_clientes_dni (dni),
  KEY idx_clientes_nombre (nombre)
);

CREATE TABLE productos (
  id_producto INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  codigo_barra VARCHAR(80) DEFAULT NULL,
  precio_compra DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  precio_venta DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  stock_minimo INT NOT NULL DEFAULT 0,
  fecha_vencimiento DATE DEFAULT NULL,
  id_categoria INT DEFAULT NULL,
  id_proveedor INT DEFAULT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  UNIQUE KEY uq_productos_codigo_barra (codigo_barra),
  KEY idx_productos_estado (estado),
  KEY idx_productos_stock (stock, stock_minimo),
  KEY idx_productos_categoria (id_categoria),
  KEY idx_productos_proveedor (id_proveedor),
  CONSTRAINT fk_productos_categoria
    FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_productos_proveedor
    FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT chk_productos_precios
    CHECK (precio_compra >= 0 AND precio_venta >= 0),
  CONSTRAINT chk_productos_stock
    CHECK (stock >= 0 AND stock_minimo >= 0)
);

CREATE TABLE ventas (
  id_venta INT NOT NULL AUTO_INCREMENT,
  id_cliente INT DEFAULT NULL,
  id_usuario INT NOT NULL,
  fecha_venta TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  metodo_pago ENUM('efectivo', 'tarjeta', 'yape', 'plin', 'transferencia') NOT NULL DEFAULT 'efectivo',
  estado ENUM('completada', 'anulada') NOT NULL DEFAULT 'completada',
  PRIMARY KEY (id_venta),
  KEY idx_ventas_fecha (fecha_venta),
  KEY idx_ventas_estado (estado),
  KEY idx_ventas_cliente (id_cliente),
  KEY idx_ventas_usuario (id_usuario),
  CONSTRAINT fk_ventas_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_ventas_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_ventas_total
    CHECK (total >= 0)
);

CREATE TABLE detalle_ventas (
  id_detalle INT NOT NULL AUTO_INCREMENT,
  id_venta INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (id_detalle),
  KEY idx_detalle_venta (id_venta),
  KEY idx_detalle_producto (id_producto),
  CONSTRAINT fk_detalle_ventas_venta
    FOREIGN KEY (id_venta) REFERENCES ventas (id_venta)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_detalle_ventas_producto
    FOREIGN KEY (id_producto) REFERENCES productos (id_producto)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_detalle_ventas_cantidad
    CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_ventas_montos
    CHECK (precio_unitario >= 0 AND subtotal >= 0)
);

CREATE TABLE notificaciones (
  id_notificacion INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('sistema', 'stock', 'venta', 'cliente') DEFAULT 'sistema',
  referencia_tipo VARCHAR(50) DEFAULT NULL,
  referencia_id INT DEFAULT NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notificacion),
  KEY idx_notificaciones_usuario (id_usuario),
  KEY idx_notificaciones_referencia (referencia_tipo, referencia_id),
  KEY idx_notificaciones_leida (leida),
  CONSTRAINT fk_notificaciones_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

INSERT INTO categorias (nombre, descripcion) VALUES
  ('Medicamentos', 'Medicamentos de venta general'),
  ('Cuidado personal', 'Productos de higiene y cuidado personal'),
  ('Primeros auxilios', 'Insumos para atencion basica');

INSERT INTO proveedores (nombre, ruc, telefono, correo, direccion) VALUES
  ('Proveedor general', '00000000000', NULL, NULL, NULL);
