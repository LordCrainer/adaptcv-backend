# Permisos de Creación de Usuarios

## Resumen de Cambios

Se ha implementado un sistema de permisos más granular para la creación de usuarios, donde **solo el superAdmin puede crear usuarios directamente activos**.

## Reglas de Negocio

### 1. Creación de Usuarios por SuperAdmin

Cuando un **superAdmin** crea un usuario:
- ✅ Puede crear cualquier tipo de usuario (superAdmin o user)
- ✅ Los usuarios creados quedan automáticamente **activos** (no necesitan verificación por email)
- ✅ Puede crear otros superAdmins
- ✅ Tiene permisos completos de gestión (CRUD)

### 2. Creación de Usuarios por Registro Público

Cuando un usuario se registra a través del endpoint público `/auth/register`:
- ⚠️ El usuario queda en estado **pending**
- 📧 Se envía un email de verificación
- ✅ Solo después de verificar el email el usuario queda **active**

### 3. Usuarios Normales

Los usuarios con rol `user`:
- ❌ No pueden crear otros usuarios
- ✅ Pueden ver información limitada de usuarios
- ❌ No pueden eliminar o modificar otros usuarios

## Implementación Técnica

### Sistema de Permisos

```typescript
// Permisos específicos para cada acción
const createUserPermission: PermissionMethod = (params) => {
  // Solo superAdmin puede crear usuarios
  return Roles.isSuperAdmin(params.role)
}

const viewUserPermission: PermissionMethod = (params) => {
  // SuperAdmin y usuarios normales pueden ver información
  return Roles.isSuperAdmin(params.role) || Roles.isUser(params.role)
}
```

### Lógica de Activación

```typescript
// En UserService.createUser()
const canCreateActiveUser = requestUser?.isSuperAdmin || false

// En registerUser()
if (body?.isSuperAdmin) {
  newUser.isSuperAdmin = body.isSuperAdmin
  // Solo se activa automáticamente si el creador puede crear usuarios activos
  if (body.canCreateActiveUser) {
    newUser.status = 'active'
  }
} else if (body.canCreateActiveUser) {
  // SuperAdmin puede crear usuarios normales ya activos
  newUser.status = 'active'
}
```

## Casos de Uso

### Caso 1: SuperAdmin crea un usuario normal
```json
POST /v1/users
Authorization: Bearer <superAdmin-token>

{
  "name": "Juan Pérez",
  "email": "juan@example.com", 
  "password": "password123",
  "role": "user"
}
```
**Resultado**: Usuario creado con status `active` ✅

### Caso 2: SuperAdmin crea otro superAdmin
```json
POST /v1/users
Authorization: Bearer <superAdmin-token>

{
  "name": "Admin Secondary",
  "email": "admin2@example.com",
  "password": "password123", 
  "role": "superAdmin"
}
```
**Resultado**: SuperAdmin creado con status `active` ✅

### Caso 3: Usuario normal intenta crear un usuario
```json
POST /v1/users
Authorization: Bearer <user-token>

{
  "name": "Otro Usuario",
  "email": "otro@example.com",
  "password": "password123",
  "role": "user"
}
```
**Resultado**: Error 403 - Forbidden ❌

### Caso 4: Registro público
```json
POST /v1/auth/register

{
  "name": "Usuario Público",
  "email": "publico@example.com",
  "password": "password123"
}
```
**Resultado**: Usuario creado con status `pending`, requiere verificación por email ⚠️

## Ventajas del Sistema de Permisos

1. **Granularidad**: Cada acción tiene permisos específicos
2. **Extensibilidad**: Fácil agregar nuevos roles y permisos
3. **Separación de responsabilidades**: Lógica de permisos separada de la lógica de negocio
4. **Flexibilidad**: Permite diferentes niveles de acceso por operación
5. **Seguridad**: Solo superAdmin puede bypear el proceso de verificación por email

## Futuras Extensiones

El sistema permite fácilmente agregar:
- Roles intermedios (ej: `admin`, `moderator`)
- Permisos más específicos (ej: solo ver usuarios de su organización)
- Permisos basados en contexto (ej: solo usuarios creados por él)
