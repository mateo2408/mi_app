# Referencia Rápida: Comentarios SOLID Aplicados

Este documento mapea cada archivo que ha sido actualizado con comentarios explícitos de principios SOLID.

## 🎯 Cómo Usar Este Documento

1. **Localizar el archivo** en la tabla de abajo
2. **Ver qué principios implementa**
3. **Abrir el archivo** para leer el comentario detallado al inicio de cada clase

---

## Tabla de Referencia

| Archivo | Ubicación | Principios SOLID | Clase/Patrón |
|---------|-----------|------------------|--------------|
| **alert.factory.js** | `CORE/patterns/` | OCP, LSP | `AlertFactory`, `AlertCreator`, `OutbreakAlertCreator`, `StockAlertCreator` |
| **outbreak.analyzer.js** | `CORE/epidemiology/` | SRP, OCP, DIP | `OutbreakAnalyzer` |
| **disease.service.js** | `CORE/epidemiology/` | SRP, ISP, DIP | `DiseaseService` |
| **epidemic.comparator.js** | `CORE/epidemiology/` | SRP, ISP, DIP | `EpidemicComparator` |
| **inventory.service.js** | `CORE/inventory/` | SRP, ISP, DIP | `InventoryService` |
| **service-container.singleton.js** | `CORE/patterns/` | DIP, Singleton | `ServiceContainer` |
| **diagnosis.repository.js** | `CORE/repositories/` | SRP, DIP | `DiagnosisRepository` |
| **disease.repository.js** | `CORE/repositories/` | SRP, DIP | `DiseaseRepository` |
| **inventory.repository.js** | `CORE/repositories/` | SRP, DIP | `InventoryRepository` |
| **diagnostics.controller.js** | `BACKEND/controllers/` | SRP, DIP | Funciones del controlador |
| **inventory.controller.js** | `BACKEND/controllers/` | SRP, DIP | Funciones del controlador |
| **dashboard.controller.js** | `BACKEND/controllers/` | SRP, DIP | `getSummary()` |
| **pets.controller.js** | `BACKEND/controllers/` | SRP, DIP | Funciones del controlador |
| **owners.controller.js** | `BACKEND/controllers/` | SRP, DIP | Funciones del controlador |

---

## 📋 Leyenda de Principios SOLID

### **S** — Single Responsibility Principle
- **Definición**: Una clase debe tener una sola razón para cambiar
- **Archivos**: Todos los repositories, servicios CORE, controladores
- **Ejemplo**: `DiseaseService` solo valida enfermedades; no accede a BD directamente

### **O** — Open/Closed Principle
- **Definición**: Abierto a extensión, cerrado a modificación
- **Archivos**: `alert.factory.js`
- **Ejemplo**: Nuevas alertas se registran via `AlertFactory.registerCreator()` sin modificar `OutbreakAnalyzer`

### **L** — Liskov Substitution Principle
- **Definición**: Los subtipos pueden sustituir a sus tipos base sin romper el contrato
- **Archivos**: `alert.factory.js` (todas las subclases de `AlertCreator`)
- **Ejemplo**: `OutbreakAlertCreator` y `StockAlertCreator` son intercambiables

### **I** — Interface Segregation Principle
- **Definición**: Ningún cliente debe depender de métodos que no usa
- **Archivos**: `disease.service.js`, `inventory.service.js`, `epidemic.comparator.js`
- **Ejemplo**: `DiseaseService` solo recibe `DiseaseRepository`, no `DiagnosisRepository`

### **D** — Dependency Inversion Principle
- **Definición**: Depender de abstracciones, no de implementaciones concretas
- **Archivos**: Todos los repositories, servicios CORE, controladores
- **Ejemplo**: Servicios dependen de repositories inyectados, no de Mongoose directamente

---

## 🔍 Ejemplos de Lectura Recomendada

Para entender cómo se aplican los principios SOLID en el proyecto, lee en este orden:

1. **Empezar por DIP**: [`CORE/patterns/service-container.singleton.js`](CORE/patterns/service-container.singleton.js)
   - Punto de inyección centralizado de todas las dependencias

2. **Ver SRP en acción**: [`CORE/epidemiology/disease.service.js`](CORE/epidemiology/disease.service.js)
   - Una clase = una responsabilidad (validación)

3. **Entender OCP + LSP**: [`CORE/patterns/alert.factory.js`](CORE/patterns/alert.factory.js)
   - Extensible sin modificación + sustitución de tipos

4. **Aplicación en capas**: [`BACKEND/controllers/diagnostics.controller.js`](BACKEND/controllers/diagnostics.controller.js)
   - Cómo un controlador orquesta servicios sin lógica de negocio

---

## 📚 Documento Asociado

Para más detalles sobre la arquitectura SOLID del proyecto, ver:
- [`SOLID_PRINCIPLES.md`](SOLID_PRINCIPLES.md) — Análisis detallado de cada principio
- [`DESIGN_PATTERNS.md`](DESIGN_PATTERNS.md) — Patrones implementados (Singleton, Factory, Repository)

---

## ✅ Verificación de Cambios

Todos los comentarios tienen el siguiente formato:

```javascript
/**
 * PRINCIPIO (Descripción clara): Nombre de la clase
 * [PRINCIPIO SECUNDARIO (si aplica)]
 *
 * Responsabilidad única: Descripción específica
 * [Detalles adicionales de implementación]
 */
```

Ejemplo real:
```javascript
/**
 * SRP (Single Responsibility Principle): Repository Pattern — Disease
 * DIP (Dependency Inversion Principle): Abstrae la lógica de acceso a datos (Mongoose)...
 */
```

---

**Última actualización**: 2026-07-07
