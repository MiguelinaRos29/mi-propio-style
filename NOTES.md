# Registro de autoría — Fase 4 del roadmap

Este archivo documenta qué partes del código son escritas a mano por mí y cuáles fueron generadas o editadas con ayuda de IA (Claude Code), para poder demostrar el requisito del Capstone de que al menos el 60% del código final sea original.

## Metodología

El registro objetivo vive en el historial de git, no en este archivo:

- Los commits que incluyen código escrito o editado por la IA llevan el trailer `Co-Authored-By: Claude` en el mensaje de commit.
- Los commits que son código escrito por mí a mano **no** llevan ese trailer.
- Se puede auditar en cualquier momento con `git log --grep="Co-Authored-By"` (commits con ayuda de IA) vs. el resto del historial.

Esta tabla es un resumen legible de ese historial, actualizado a medida que avanzo. Las filas marcadas "IA" las llenó Claude explicando exactamente qué escribió; las filas marcadas "Yo" las lleno yo misma.

## Registro

| Fecha | Área | Autor | Detalle |
|---|---|---|---|
| 2026-08-23 | `services/auth/` (completo: modelos, esquemas, seguridad JWT, endpoints registro/login/me) | IA | Generado completo por Claude — pendiente que yo lo revise/reescriba a mano según el plan acordado. |
| 2026-08-23 | `services/catalogo/app/auth.py`, `services/ordenes/app/auth.py` | IA | Dependencias de verificación de JWT y roles, generadas por Claude. |
| 2026-08-23 | `services/catalogo/app/main.py`, `services/catalogo/app/schemas.py`, `services/catalogo/requirements.txt` | IA (edición sobre código previo) | Claude añadió los chequeos de ownership y las dependencias de rol sobre el CRUD que ya existía. |
| 2026-08-23 | `services/ordenes/app/main.py`, `services/ordenes/app/schemas.py`, `services/ordenes/requirements.txt` | IA (edición sobre código previo) | Igual que arriba, para el servicio de órdenes. |
| 2026-08-23 | `services/ordenes/app/database.py`, `services/ordenes/app/models.py`, `services/catalogo/app/models.py` | Yo | No tocados por la IA en esta sesión — se mantienen como estaban. |
| 2026-08-23 | `services/auth/app/main.py`, `services/catalogo/app/main.py`, `services/ordenes/app/main.py` (CORS) | IA | Claude agregó `CORSMiddleware` en los 3 servicios para que el frontend en localhost pueda llamarlos. |
| 2026-08-23 | `frontend/` scaffolding (Vite, `npm create vite`) | Herramienta | Boilerplate generado por `create-vite`, sin autoría de nadie en particular — no cuenta como código de IA ni mío. |
| 2026-08-23 | `frontend/vite.config.js`, `frontend/src/index.css` (theme Tailwind), `frontend/.env.example` | IA | Claude instaló y conectó el plugin de Tailwind, definió los tokens de color terracota/café/dorado, y las variables `VITE_*` con las URLs de los 3 backends. |
| | `frontend/` | Yo | Pendiente de empezar — plan es que sea 100% escrito a mano. |
| | Función autoaprendida (notificación de email por baja de precio en wishlist) | Yo | Pendiente — Claude solo debe explicar el concepto (APScheduler, integración de email), no escribir el código final. |

## Cómo sigo llenando esto
Cada vez que yo escriba una parte a mano, agrego una fila con fecha, área y una nota corta. Cada vez que la IA escriba o edite algo, la IA agrega su propia fila explicando exactamente qué hizo.

"2026-08-23 — housekeeping: se extrajo referencia de ordenes/app/auth.py y de services/auth/ completo antes de reescribir a mano; originales vaciados, sin pérdida de contenido (recuperable en commit 24a2a2e)" — así el registro queda fiel a lo que realmente pasó, incluida esta parte de reorganización.

## Servicio de Auth terminado 
Con fecha 26/08/2026

## 28 de agosto de 2026 — Servicio de autenticación completado + control de calidad del repo

**Escrito a mano (100%):**
- `services/auth/app/database.py` — configuración de engine, SessionLocal y Base con SQLAlchemy
- `services/auth/app/models.py` — modelo de Usuario
- `services/auth/app/schemas.py` — esquemas Pydantic de entrada/salida
- `services/auth/app/security.py` — hashing de contraseñas y generación/verificación de JWT
- `services/auth/app/auth.py` — endpoints de registro, login y /me
- `services/auth/app/main.py` — configuración de la app FastAPI

**Decisiones de diseño:**
- El servicio de auth fue generado originalmente por IA como referencia; se reescribió por completo a mano, línea por línea, para cumplir el requisito del 60% de código original del capstone.
- El código original de IA se conservó como referencia personal en `services/auth_ia_referencia_completo/`, mapeado a `.gitignore` para que no forme parte del entregable final (no se sabe si la evaluación del 60% será manual o automática, así que se optó por excluirlo directamente en vez de confiar en que no cuente).
- Mismo criterio aplicado a `services/ordenes/app/ordenes_auth_ia_referencia.py`, referencia para cuando le toque su turno al servicio de órdenes.

**Control de calidad del repositorio (mismo día):**
- Corregidos errores de tipeo en `.gitignore` que impedían que los archivos de referencia de IA se ignoraran correctamente (guion medio en vez de guion bajo, y nombre de archivo incompleto).
- Removidos del tracking de Git los `.pyc` de `__pycache__` en `services/catalogo/app/` que se habían comiteado antes de existir la regla en `.gitignore`.
- Agregada `.claude/` al `.gitignore` (configuración local de la herramienta, no parte del proyecto).
- Verificado que `services/ordenes/app/auth.py` sigue vacío como corresponde (el código de verificación JWT que había ahí por error permanece recuperable en el historial de Git para cuando se implemente esa parte).

**Siguiente paso:** servicio de catálogo (modelos de productos, CRUD, filtros).