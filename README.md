# Threats Demo

## Requisitos

- Node.js 20+
- npm
- Docker Desktop, solo si se quiere levantar con contenedores

## Levantar en local

```bash
npm install
npm run install:all
npm run dev
```

La aplicación queda disponible en:

- Web: `http://localhost:5173`
- API: `http://localhost:3001`

## Levantar por separado

```bash
npm run dev:web
npm run dev:api
```

## Levantar con Docker

```bash
npm run docker:up
```

La aplicación queda disponible en:

- Web: `http://localhost:8080`
- API: `http://localhost:3001`

Para detener los contenedores:

```bash
npm run docker:down
```

## Generar build

```bash
npm run build
npm --prefix apps/api run build
```
