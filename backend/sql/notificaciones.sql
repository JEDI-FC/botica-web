CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  titulo VARCHAR(120) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('sistema','stock','venta','cliente') DEFAULT 'sistema',
  referencia_tipo VARCHAR(50) DEFAULT NULL,
  referencia_id INT DEFAULT NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notificacion),
  KEY id_usuario (id_usuario),
  KEY referencia (referencia_tipo, referencia_id),
  CONSTRAINT notificaciones_ibfk_1
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    ON DELETE CASCADE
);
