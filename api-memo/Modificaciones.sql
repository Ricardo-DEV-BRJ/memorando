ALTER TABLE login ADD per_super BOOLEAN  DEFAULT 0;
ALTER TABLE memorando ADD folio_me VARCHAR(50) UNIQUE;

-- 04/10/2026
ALTER TABLE memorando ADD estado VARCHAR(20) DEFAULT NULL;

-- 07/10/2026

CREATE TABLE IF NOT EXISTS departamentos(
  id_dep VARCHAR(11) PRIMARY KEY AUTO_INCREMENT,
  nombre_dep VARCHAR(100) NOT NULL
);

INSERT INTO departamentos (nombre_dep) VALUES
('Centro Aldea Tecnológica'),
('Casa luna'),
('TienditaUVM'),
('Rectorado'),
('Vicerrectorado Académico'),
('Vicerrectorado Administrativo'),
('Decanato de Investigación y Postgrado'),
('Decanato de Facultad de Ingeniería'),
('Decanato de Facultad De Ciencias Económicas, Administrativas Y Gerenciales'),
('Decanato de Facultad De Ciencias Jurídicas, Políticas Y Sociales'),
('Servicios Integrales'),
('GenteUVM'),
('Centro de Idiomas'),
('Proyección Institucional'),
('Secretaria Academica');

ALTER TABLE responsable 
ADD email_resp VARCHAR(100),
ADD id_dep INT,
ADD CONSTRAINT fk_responsable_departamento FOREIGN KEY (id_dep) REFERENCES departamentos(id_dep);

ALTER TABLE equipo ADD id_dep INT;
ALTER TABLE equipo ADD CONSTRAINT fk_equipos_departamento FOREIGN KEY (id_dep) REFERENCES departamentos(id_dep);

UPDATE equipo SET id_dep = 1;

ALTER TABLE memorando ADD id_dep INT;
ALTER TABLE memorando ADD CONSTRAINT fk_memorando_departamento FOREIGN KEY (id_dep) REFERENCES departamentos(id_dep);

UPDATE memorando SET id_dep = 1;

ALTER TABLE memorando MODIFY pa_quien INT;
ALTER TABLE memorando ADD vigilancia INT DEFAULT 11;
UPDATE memorando SET pa_quien = 2;

ALTER TABLE login MODIFY permisos INT DEFAULT 2;

ALTER TABLE departamentos ADD email VARCHAR(100);

