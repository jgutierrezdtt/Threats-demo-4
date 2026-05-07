# PlatformSuite Enterprise v2.4 — Guía de Explotación

Aplicación demo con vulnerabilidades de lógica de negocio intencionadas para ejercicios de seguridad ofensiva.

---

## 1. Entradas Fútbol — IDOR via parámetro de URL

**Tipo:** IDOR (Insecure Direct Object Reference)  
**CWE:** CWE-639 — Authorization Bypass Through User-Controlled Key

### Contexto
Los partidos marcados como "Solo Socios" están bloqueados en la UI: el botón redirige al área de registro de socios y no es posible llegar al checkout de forma normal.

### Explotación
El parámetro `?match=` de la URL se lee directamente en el cliente sin validar la membresía del usuario:

```
http://localhost:5173/?tab=futbol&match=RM-FCB-001
```

**IDs de partidos restringidos:**

| ID | Partido |
|----|---------|
| `RM-FCB-001` | Real Madrid CF vs FC Barcelona |
| `RBE-RMA-004` | Real Betis vs Real Madrid CF |
| `FCB-AJX-005` | FC Barcelona vs Ajax |

### Pasos
1. Acceder a la pestaña Entradas Fútbol — los partidos de socios muestran "Acceso socios →".
2. Modificar la URL añadiendo `&match=RM-FCB-001`.
3. La página carga el partido restringido directamente con el formulario de compra disponible.
4. Completar el checkout — se genera una entrada válida sin ser socio.

### Código vulnerable
```typescript
// apps/web/src/tabs/futbol/index.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const matchId = params.get('match')
  if (matchId) {
    const m = MATCHES.find(m => m.id === matchId)
    // No se valida m.sociOnly — acceso directo a partidos restringidos vía URL
    if (m) { setSelectedMatch(m); setView('detalle') }
  }
}, [])
```

---

## 2. Portal Sanitario — Acceso cross-paciente via RAG

**Tipo:** Broken Access Control  
**CWE:** CWE-284 — Improper Access Control

### Contexto
El Portal Sanitario SIH permite a médicos consultar el historial clínico de sus pacientes mediante un asistente RAG. El médico activo se selecciona desde la propia interfaz.

### Explotación
El estado `currentDoctor` es mutable desde la UI sin validación de credenciales. El asistente devuelve datos de cualquier paciente sin cruzar la asignación médico-paciente.

### Pasos
1. Acceder a la pestaña Portal Sanitario.
2. En el hero del dashboard, cambiar el médico activo a cualquier otro (botones visibles en la interfaz).
3. En el Asistente IA, preguntar por un paciente de otra especialidad: *"Muéstrame el historial de [paciente de oncología]"*.
4. El asistente devuelve el expediente completo sin restricción.
5. El historial de consultas ("Historial") muestra consultas de todos los médicos sin filtrar.

### Código vulnerable
```typescript
// apps/web/src/tabs/hospital/index.tsx
// currentDoctor es estado local, cambiable libremente desde UI
const [currentDoctor, setCurrentDoctor] = useState(DOCTORS[0])

// El RAG busca en TODOS los pacientes sin validar assignedDoctor
const results = PATIENTS.filter(p =>
  p.name.toLowerCase().includes(keyword) ||
  p.diagnosis.toLowerCase().includes(keyword)
  // No hay: && p.assignedDoctor === currentDoctor.id
)
```

---

## 3. Seguros MAPFRE — Acumulación ilimitada de códigos promocionales

**Tipo:** Business Logic Error  
**CWE:** CWE-840 — Business Logic Errors

### Contexto
El cotizador de seguros permite aplicar códigos promocionales para obtener descuentos. No existe ningún límite en el número de códigos aplicables ni en el porcentaje total acumulado.

### Códigos disponibles

| Código | Descuento |
|--------|-----------|
| `ONLINE10` | −10% |
| `VERANO26` | −15% |
| `FAMILIA` | −20% |
| `FIDELIDAD` | −25% |
| `VIP2026` | −30% |
| `EMPLEADO40` | −40% |
| `NUEVO50` | −50% |

### Explotación
1. Acceder a Seguros → Cotizador → seleccionar cualquier producto.
2. Aplicar `ONLINE10` → precio baja un 10%.
3. Aplicar `VERANO26` → descuento acumulado: 25%.
4. Aplicar `FAMILIA` → acumulado: 45%.
5. Aplicar `FIDELIDAD` → acumulado: 70%.
6. Aplicar `NUEVO50` → acumulado: 120% → precio final: **0,00 €**.

### Código vulnerable
```typescript
// apps/web/src/tabs/seguros/index.tsx
const calcPrice = () => {
  let base = product.basePrice * ageMultiplier
  // Sin límite: el descuento puede superar el 100%
  const totalDiscount = quote.appliedCodes.reduce((acc, c) => acc + c.discount, 0)
  base = base * (1 - totalDiscount / 100)
  return Math.max(base, 0)  // Math.max evita precio negativo pero permite 0€
}
```

---

## 4. Infraestructura Telco — Misconfiguraciones Terraform

**Tipo:** Security Misconfiguration  
**CWE:** CWE-732 — Incorrect Permission Assignment for Critical Resource

### Misconfigurations detectadas

| Archivo | Recurso | Problema |
|---------|---------|---------|
| `compute.tf` | Security Group | SSH (22), HTTP (80), HTTPS (443) abiertos a `0.0.0.0/0` |
| `database.tf` | RDS | `publicly_accessible = true`, `skip_final_snapshot = true` |
| `iam.tf` | IAM Role Policy | `Action: "*"` y `Resource: "*"` — privilegios totales |
| `vpc.tf` | Subnet pública | `map_public_ip_on_launch = true` |
| `variables.tf` | Variable | `admin_password` en texto plano, sin `sensitive = true` |
| `storage.tf` | S3 Bucket | `acl = "public-read"` — bucket público |

### Explotación
1. Acceder a la pestaña Infraestructura Telco → Editor HCL.
2. Revisar `compute.tf`: `cidr_blocks = ["0.0.0.0/0"]` en reglas SSH — cualquier IP puede conectar al puerto 22.
3. Revisar `iam.tf`: el rol tiene `Action: "*"` y `Resource: "*"` — un atacante con acceso al rol puede hacer cualquier acción en AWS.
4. Revisar `variables.tf`: la variable `admin_password` expone la contraseña en el plan de Terraform (logs de CI/CD).
5. Revisar `storage.tf`: bucket S3 con ACL pública — cualquier objeto subido es accesible sin autenticación.

---

## 5. Gestor de Publicaciones — Exposición cross-usuario

**Tipo:** Insecure Direct Object Reference / Broken Access Control  
**CWE:** CWE-639 — Authorization Bypass Through User-Controlled Key

### Contexto
El gestor carga al inicio el array `SAMPLE_LINKS` que contiene publicaciones de múltiples usuarios (`user-me`, `user-1`, `user-2`, `user-3`...). No existe filtrado real por propietario.

### Explotación
1. Acceder a Gestor de Publicaciones → "Mis Links".
2. La lista muestra todos los links con badge naranja **"Usuario: user-X"** para los que no son propios.
3. Los botones Editar y Eliminar funcionan sobre links de otros usuarios sin ninguna verificación.
4. `CURRENT_USER_ID = 'user-me'` está hardcodeado en cliente — cualquier cambio en el código da acceso total.

### Código vulnerable
```typescript
// apps/web/src/tabs/link-manager/index.tsx
const CURRENT_USER_ID = 'user-me'

// Estado inicial carga TODOS los links de todos los usuarios
const [links, setLinks] = useState<Link[]>(INITIAL_LINKS)

// deleteLink no valida link.userId === CURRENT_USER_ID
const deleteLink = (id: string) => {
  setLinks(prev => prev.filter(l => l.id !== id))
}
```

---

## 6. Registro y Títulos — IDOR en consulta pública + Auth bypass

**Tipo:** IDOR + Authentication Bypass  
**CWE:** CWE-284 — Improper Access Control

### Explotación 1 — Consulta pública sin autenticación

1. Acceder al portal sin identificarse → "Consultar título público".
2. Buscar el DNI de cualquier ciudadano: `22334455-G`, `33445566-H`, `44556677-I`.
3. El sistema devuelve el expediente académico completo: nombre, email, fecha de nacimiento, títulos, universidades y `certCode`.
4. No existe ningún control de acceso — la función `doSearch()` filtra sobre `REGISTERED_USERS` completo.

### Explotación 2 — Login sin contraseña

1. Ir a "Acceder con DNI".
2. Introducir cualquier DNI válido: `11223344-F`.
3. La contraseña es ignorada completamente — `doLogin()` solo comprueba que el DNI exista.
4. Acceso completo al dashboard del ciudadano.

### DNIs válidos

| DNI | Ciudadano |
|-----|-----------|
| `11223344-F` | Sofía Morales Vargas |
| `22334455-G` | Daniel Herrero Fuentes |
| `33445566-H` | (tercer registro) |
| `44556677-I` | (cuarto registro) |

### Código vulnerable
```typescript
// apps/web/src/tabs/portal-publico/index.tsx
const doLogin = () => {
  // Solo valida que el DNI exista — la contraseña introducida es ignorada
  const user = REGISTERED_USERS.find(u =>
    u.dni.toUpperCase() === loginForm.dni.toUpperCase().trim()
  )
  if (user) {
    setSession({ ...user, loggedIn: true })
    setView('dashboard')
  }
}
```

---

## Resumen

| Módulo | Vulnerabilidad | CWE |
|--------|---------------|-----|
| Entradas Fútbol | IDOR via `?match=` | CWE-639 |
| Portal Sanitario | Acceso cross-paciente, médico mutable | CWE-284 |
| Seguros MAPFRE | Códigos promo sin límite → precio 0€ | CWE-840 |
| Infraestructura Telco | SSH 0.0.0.0/0, IAM `*`, S3 público | CWE-732 |
| Gestor de Publicaciones | Datos de otros usuarios en estado global | CWE-639 |
| Registro y Títulos | Consulta pública IDOR + login sin contraseña | CWE-284 |
