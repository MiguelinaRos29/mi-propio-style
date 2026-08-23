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
| | `frontend/` | Yo | Pendiente de empezar — plan es que sea 100% escrito a mano. |
| | Función autoaprendida (notificación de email por baja de precio en wishlist) | Yo | Pendiente — Claude solo debe explicar el concepto (APScheduler, integración de email), no escribir el código final. |

## Cómo sigo llenando esto
Cada vez que yo escriba una parte a mano, agrego una fila con fecha, área y una nota corta. Cada vez que la IA escriba o edite algo, la IA agrega su propia fila explicando exactamente qué hizo.
