# Principios SOLID en VetCore

Este documento mapea cada principio SOLID a implementaciones concretas en el proyecto VetCore.

---

## S — Single Responsibility Principle (Responsabilidad Única)

> *Una clase debe tener una sola razón para cambiar.*

Cada capa y módulo tiene **una responsabilidad clara**:

| Módulo | Responsabilidad única |
|--------|----------------------|
| `CORE/epidemiology/outbreak.analyzer.js` | Analizar brotes epidemiológicos |
| `CORE/epidemiology/disease.service.js` | Validar y enriquecer datos de enfermedades |
| `CORE/inventory/inventory.service.js` | Gestionar stock y disponibilidad de medicamentos |
| `CORE/repositories/*.repository.js` | Acceso a datos (MongoDB/Mongoose) |
| `BACKEND/controllers/*.controller.js` | Orquestar HTTP: validar entrada, delegar a CORE, responder |
| `FRONTEND/src/app/core/*.service.ts` | Comunicación HTTP con la API |
| `FRONTEND/src/app/pages/*.component.ts` | Presentación y UI |

**Ejemplo — Controller vs CORE:**

```javascript
// BACKEND/controllers/diagnostics.controller.js
// Solo orquesta: guarda en BD y delega el análisis al CORE.
const diagnosis = await repositories.DiagnosisRepository.create({ petName, diseaseId });
const outbreakAnalysis = await outbreakAnalyzer.analyzeDisease(diseaseId);
```

El controlador **no** calcula umbrales de brote ni genera alertas; eso es responsabilidad de `OutbreakAnalyzer`.

---

## O — Open/Closed Principle (Abierto/Cerrado)

> *Abierto a extensión, cerrado a modificación.*

**AlertFactory** permite agregar nuevos tipos de alerta sin modificar `OutbreakAnalyzer`:

```javascript
// CORE/patterns/alert.factory.js
class AlertFactory {
    static registerCreator(type, creator) {
        AlertFactory.#creators[type] = creator;
    }
}
```

Para agregar una alerta de vacunación masiva:
1. Crear `VaccinationAlertCreator extends AlertCreator`
2. Registrar con `AlertFactory.registerCreator('VACCINATION', new VaccinationAlertCreator())`
3. **No** modificar `OutbreakAnalyzer` ni los creadores existentes

**EpidemicComparator** extiende el análisis de `OutbreakAnalyzer` agregando interpretación y reportes, sin alterar el analizador base.

---

## L — Liskov Substitution Principle (Sustitución de Liskov)

> *Los subtipos deben poder sustituir a sus tipos base sin alterar el comportamiento.*

Los creadores de alertas son intercambiables porque todos implementan `createAlert()`:

```javascript
// CORE/patterns/alert.factory.js
class AlertCreator {
    createAlert(_context) {
        throw new Error('createAlert() debe ser implementado por la subclase');
    }
}

class OutbreakAlertCreator extends AlertCreator { /* ... */ }
class StockAlertCreator extends AlertCreator { /* ... */ }
```

`AlertFactory.create()` invoca cualquier `AlertCreator` sin conocer la subclase concreta. Un `StockAlertCreator` puede sustituir a `OutbreakAlertCreator` en el registro del factory sin romper el contrato.

---

## I — Interface Segregation Principle (Segregación de Interfaces)

> *Ningún cliente debe depender de métodos que no usa.*

Los servicios CORE reciben **solo las dependencias que necesitan**:

```javascript
// OutbreakAnalyzer: solo diagnosis, disease e inventory
class OutbreakAnalyzer {
    constructor(diagnosisRepository, diseaseRepository, inventoryService) { /* ... */ }
}

// DiseaseService: solo disease repository
class DiseaseService {
    constructor(diseaseRepository) { /* ... */ }
}

// EpidemicComparator: solo outbreak analyzer
class EpidemicComparator {
    constructor(outbreakAnalyzer) { /* ... */ }
}
```

`DiseaseService` no recibe `DiagnosisRepository` porque no lo necesita. Cada servicio expone una API acotada a su dominio (`validateDiseaseData`, `analyzeDisease`, `getMedicationAvailability`, etc.).

En el frontend, `DiagnosisService` y `ApiService` están separados: diagnósticos/epidemiología vs. CRUD general (mascotas, citas, dueños).

---

## D — Dependency Inversion Principle (Inversión de Dependencias)

> *Depender de abstracciones, no de implementaciones concretas.*

**Backend — Inyección de dependencias en CORE:**

```javascript
// CORE/patterns/service-container.singleton.js
this.services.outbreakAnalyzer = new OutbreakAnalyzer(
    DiagnosisRepository,
    DiseaseRepository,
    this.services.inventoryService
);
```

Los servicios dependen de **repositorios inyectados**, no instancian Mongoose directamente. Esto permite:
- Sustituir repositorios por mocks en tests
- Cambiar la fuente de datos sin tocar la lógica de negocio

**Frontend — Inyección de Angular:**

```typescript
// FRONTEND/src/app/core/diagnosis.service.ts
@Injectable({ providedIn: 'root' })
export class DiagnosisService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
}
```

Los componentes dependen de `DiagnosisService` (abstracción), no de `HttpClient` directamente.

**Flujo de capas (DIP en arquitectura):**

```
Component → Service (abstracción) → Controller → CORE Service → Repository
```

Las capas superiores no conocen detalles de MongoDB ni Express.

---

## Resumen visual

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Angular Services)          ← DIP, ISP, SRP       │
├─────────────────────────────────────────────────────────────┤
│  BACKEND (Controllers)                ← SRP, DIP            │
├─────────────────────────────────────────────────────────────┤
│  CORE (Business Logic)                ← SRP, OCP, LSP, DIP  │
│    ├── patterns/ (Singleton, Factory) ← OCP, LSP            │
│    ├── epidemiology/                                        │
│    ├── inventory/                                           │
│    └── repositories/                  ← SRP, DIP              │
└─────────────────────────────────────────────────────────────┘
```

---

## Referencias en el código

| Principio | Archivo principal |
|-----------|-------------------|
| SRP | `outbreak.analyzer.js`, `diagnostics.controller.js` |
| OCP | `alert.factory.js`, `AlertFactory.registerCreator()` |
| LSP | `OutbreakAlertCreator`, `StockAlertCreator` |
| ISP | Constructores de servicios CORE |
| DIP | `service-container.singleton.js`, `@Injectable` Angular |

Ver también: [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md)
