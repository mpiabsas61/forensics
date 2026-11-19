# Gestión de Peritos Informáticos – IFTS 16

API REST (Express + Sequelize) para administrar peritos con baja lógica.

## Ejecución
npm install
cp .env.example .env     # configurar variables
npm run seed             # (opcional) recrea roles y 3 usuarios de prueba
npm start                # http://localhost:3000

`forensics.db` ya viene incluido con 3 usuarios precargados.

## SQLite (desarrollo) / PostgreSQL (producción)
Se alterna con `DB_DIALECT` en `.env` (`sqlite` o `postgres`). Para Postgres:


docker run -d --name pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=forensics -p 5432:5432 postgres:16

y en `.env`: `DB_DIALECT=postgres`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`.
Modelos y controladores no cambian.

## Endpoints
| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/v1/peritos | Alta. Body: `{"username":"x","role_id":2}`. 400 validación, 409 duplicado |
| GET | /api/v1/peritos?role=ADMIN | Lista activos (LEFT JOIN roles), filtro opcional |
| GET | /api/v1/peritos/:id | Detalle con rol. 404 si no existe o está inactivo |
| DELETE | /api/v1/peritos/:id | Baja lógica (`active=false`). 404 si no existe |

## Consola
Morgan registra HTTP. Chalk: **cyan** = alta/baja, **yellow** = validación (campo fallido), **red** = error 500 con stack.

“Se fuerza validator >= 13.15.22 mediante overrides por el aviso CVE-2025-12758”.  