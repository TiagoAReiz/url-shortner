<h1 align="center">🔗 URL Shortner</h1>

<p align="center">
  Encurtador de URLs rápido e escalável, feito com <b>NestJS</b>, <b>PostgreSQL</b> e <b>Redis</b>.
</p>

<p align="center">
  <img alt="NestJS" src="https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" />
  <img alt="Redis" src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" />
</p>

---

## ✨ Como funciona

1. Você envia uma URL de destino para `POST /shortner`.
2. A API gera um **ID de 7 caracteres em base62** (≈ 3,5 trilhões de combinações), salva no Postgres e devolve o link curto.
3. Ao acessar `GET /:id`, o app procura primeiro no **Redis** (cache-aside, TTL de 12h). Se não achar, busca no Postgres, popula o cache e **redireciona (302)** para o destino.
4. Links expiram em **30 dias** por padrão.

```
POST /shortner                       GET /abc1234
{ "destination_url": "https://..." } ──► 302 → https://...
        │
        ▼
{ "short_url": "http://localhost:3001/abc1234" }
```

## 🏗️ Arquitetura

O projeto segue **arquitetura hexagonal (ports & adapters)**: o domínio e os casos de uso não conhecem Postgres nem Redis, só as interfaces (*ports*).

```
src/shortner
├── adapters
│   ├── inbound/controllers     # HTTP (controller + DTO)
│   └── outbound
│       ├── cache               # RedisClient
│       └── repositories        # ShortnerRepositoryImpl (Prisma)
├── application
│   ├── ports                   # interfaces (inbound/outbound)
│   ├── services                # ShortnerService
│   └── mappers                 # DTO -> entidade (gera o ID)
└── domain                      # entidades e exceções
```

### 🗺️ Visão planejada

<p align="center">
  <img src="backend/docs/architecture.png" alt="Arquitetura planejada: load balancer, containers, Redis, banco e consumer de estatísticas" width="780" />
</p>

- **Load balancer** distribuindo as requisições entre várias instâncias (containers) da API.
- **Redis** como cache de leitura dos redirecionamentos.
- **Banco de dados** (PostgreSQL) como fonte da verdade.
- **Message broker + Statistics consumer** *(planejado)*: cada acesso gera um evento, e um consumer processa as estatísticas de forma assíncrona, sem pesar no redirecionamento.

## 🚀 Rodando localmente

**Pré-requisitos:** Node.js 22+, Docker.

```bash
# 1. dependências
npm install

# 2. Postgres e Redis
docker compose -f docker.compose.yaml up -d

# 3. variáveis de ambiente
cp .env.example .env
# ajuste o DATABASE_URL para bater com o docker compose:
# postgresql://user:example@localhost:5432/mydb

# 4. subir a API
npm run start:dev
```

### Variáveis de ambiente

| Variável       | Descrição                                           | Exemplo                                      |
| -------------- | --------------------------------------------------- | -------------------------------------------- |
| `DATABASE_URL` | Conexão com o PostgreSQL (>= 15)                    | `postgresql://user:example@localhost:5432/mydb` |
| `APP_URL`      | URL pública base, usada para montar o link curto    | `http://localhost:3001`                      |
| `PORT`         | Porta da API (padrão `3000`)                        | `3001`                                       |

## 📡 API

### Criar link curto

```bash
curl -X POST http://localhost:3001/shortner \
  -H "Content-Type: application/json" \
  -d '{ "destination_url": "https://github.com/TiagoAReiz" }'
```

```json
{ "short_url": "http://localhost:3001/aB3dE9x" }
```

A `destination_url` precisa ser uma URL válida **com protocolo** (`http://` ou `https://`).

### Acessar link curto

```bash
curl -i http://localhost:3001/aB3dE9x
# HTTP/1.1 302 Found
# Location: https://github.com/TiagoAReiz
```

Se o ID não existir, a resposta é `404`.

## 🧪 Testes

```bash
npm test            # unitários (service, repository, redis client)
npm run test:cov    # com cobertura
npm run test:e2e    # e2e
```

## 🛠️ Stack

- [NestJS](https://nestjs.com/) + TypeScript
- [Prisma 8](https://www.prisma.io/) para acesso ao PostgreSQL
- [Redis](https://redis.io/) como cache
- [Vitest](https://vitest.dev/) para testes
- [oxlint](https://oxc.rs/) para lint

## 🗺️ Roadmap

- [x] Criação e redirecionamento de links
- [x] Cache com Redis
- [ ] Load balancer + múltiplas instâncias em containers
- [ ] Message broker e consumer de estatísticas de acesso
- [ ] Endpoint de estatísticas por link
