-- 1. Tabla: Ubicacion
CREATE TABLE ubicacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT,
    eliminado BOOLEAN DEFAULT FALSE
);

-- 2. Tabla: Responsable
CREATE TABLE responsable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    firma VARCHAR(255),
    eliminado BOOLEAN DEFAULT FALSE
);

-- 3. Tabla: Equipo (con campo imagen en Base64)
CREATE TABLE equipo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    serial VARCHAR(100),
    imagen LONGTEXT,
    descripcion TEXT,
    estado VARCHAR(50),
    eliminado BOOLEAN DEFAULT FALSE
);

-- 4. Tabla: Memorando
CREATE TABLE memorando (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_responsable INT NOT NULL,
    id_ubicacion INT NOT NULL,
    asunto VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (id_responsable) REFERENCES responsable(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ubicacion) REFERENCES ubicacion(id) ON DELETE CASCADE
);

-- 5. Tabla: Equipo_Memo
CREATE TABLE equipo_memo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_memo INT NOT NULL,
    id_equipo INT NOT NULL,
    FOREIGN KEY (id_memo) REFERENCES memorando(id) ON DELETE CASCADE,
    FOREIGN KEY (id_equipo) REFERENCES equipo(id) ON DELETE CASCADE
);

CREATE TABLE login (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_responsable INT NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    clave VARCHAR(255) NOT NULL,
    fec_crea datetime DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_responsable) REFERENCES responsable(id) ON DELETE CASCADE
);