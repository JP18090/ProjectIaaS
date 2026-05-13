# ☁️ ProjectIaaS - Catálogo de Veículos com Infraestrutura AWS

Projeto desenvolvido com foco em **containerização, arquitetura em nuvem e deploy em AWS**, utilizando uma aplicação full-stack de **catálogo de veículos automotivos**, com **back-end em Java Spring Boot** e **front-end em HTML, CSS e JavaScript**, executados com **Docker**. No ambiente em nuvem, a solução foi organizada em uma **VPC com subnet pública e subnet privada**, com instância EC2 executando os containers, banco de dados PostgreSQL no Amazon RDS e rota de relatório servida por **AWS Lambda**, com tráfego gerenciado pelo **API Gateway**.

## 👨‍💻 Desenvolvedores

- Gabriel Labarca Del Bianco
- [José Pedro Bitetti](https://github.com/JP18090)
- [Gustavo Netto](https://github.com/gustavonc05)

---

## 🧭 Visão Geral

A aplicação permite ao usuário:

- Cadastrar veículos no catálogo
- Listar, editar e remover veículos
- Consultar um relatório agregado com estatísticas do catálogo

O projeto foi estruturado para separar claramente as responsabilidades entre interface, API e infraestrutura, aplicando conceitos de IaaS com isolamento de rede e execução conteinerizada.

---

## 🛠️ Etapas do Desenvolvimento

### ☁️ 1. Infraestrutura AWS

A infraestrutura foi planejada dentro de uma **VPC** com faixa `10.0.0.0/16`, contendo uma **subnet pública** e subnets privadas, com uso de **Internet Gateway**, **NAT Gateway** e tabelas de rota separadas. Uma instância EC2 na subnet pública executa os containers de front-end e back-end, enquanto o banco de dados PostgreSQL reside em uma instância RDS na **subnet privada**, sem acesso público.

#### 📌 Fluxo de tráfego

```
Internet
  → API Gateway
       → /report       → Lambda (Node.js 18)
       → /{proxy+}     → EC2 Ubuntu 22.04 (Docker)
                             → Spring Boot :3000
                                   → RDS PostgreSQL (subnet privada)
```

#### 📌 Organização da rede

| Componente | Tipo / Tecnologia | Detalhes |
|---|---|---|
| VPC | Rede AWS | 10.0.0.0/16 |
| Subnet Pública | AWS Subnet | Hospeda a EC2 |
| Subnet Privada | AWS Subnet | Hospeda o RDS PostgreSQL |
| Internet Gateway | Gateway | Acesso externo (0.0.0.0/0) |
| NAT Gateway | Gateway | Saída da rede privada |
| Tabela de Rota Pública | Routing | Internet Gateway |
| Tabela de Rota Privada | Routing | NAT Gateway |
| EC2 | t2.micro Ubuntu 22.04 | Subnet pública, executa Docker |
| RDS PostgreSQL | db.t3.micro | Subnet privada, porta 5432 |
| Lambda | Node.js 18 | Função `report-function` |
| API Gateway | AWS API Gateway | Roteia `/report` e `/{proxy+}` |
| Grupo de Segurança | Firewall AWS | Protege EC2 e RDS |

---

### 🧱 2. Arquitetura dos Componentes

O projeto está estruturado da seguinte forma no repositório: um `docker-compose.yml` na raiz orquestra os serviços localmente, o diretório `backend` concentra a API REST em Spring Boot e o diretório `frontend` concentra a interface web.

```text
ProjectIaaS/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/projectiaas/catalog/
│       ├── CatalogApplication.java
│       ├── controller/ItemController.java
│       ├── dto/VehicleRequest.java
│       ├── dto/VehicleResponse.java
│       ├── entity/Vehicle.java
│       ├── repository/VehicleRepository.java
│       └── service/VehicleService.java
└── frontend/
    ├── Dockerfile
    ├── server.js
    ├── vite.config.js
    ├── index.html
    ├── package.json
    └── src/
        ├── App.jsx
        ├── api/items.js
        └── components/
            ├── VehicleForm.jsx
            ├── VehicleList.jsx
            └── ReportPanel.jsx
```

| Componente | Tecnologia | Porta |
|---|---|---|
| Backend | Java 21 + Spring Boot 3 | 3000 |
| Frontend | React + Vite + Express.js | 80 |
| Banco de dados | PostgreSQL (RDS) | 5432 |
| Relatório | Node.js 18 (Lambda) | — |

---

### ⚙️ 3. Back-end

O back-end foi desenvolvido em **Java com Spring Boot**, utilizando **Spring Data JPA** e banco **PostgreSQL**. A API REST é responsável por manipular os veículos do catálogo, permitindo operações de criação, leitura, atualização e remoção (CRUD) pela rota `/items`. A entidade interna se chama `Vehicle`, mas o contrato externo usa `/items` para atender ao requisito da disciplina. O back-end também consome a **API FIPE** para enriquecer os dados dos veículos.

#### 📌 Estrutura do back-end

- `CatalogApplication.java`: classe principal da aplicação
- `entity/Vehicle.java`: entidade JPA mapeada para a tabela `vehicles`
- `repository/VehicleRepository.java`: repositório de dados com Spring Data
- `service/VehicleService.java`: regras de negócio
- `controller/ItemController.java`: controller REST com os endpoints expostos em `/items`
- `dto/`: objetos de entrada (`VehicleRequest`) e saída (`VehicleResponse`)

---

### 💻 4. Front-end

O front-end foi desenvolvido em **React** com **Vite** como build tool. Em produção, um servidor **Express.js** (`server.js`) serve os arquivos estáticos gerados pelo Vite (`dist/`) e atua como proxy reverso: todas as requisições para `/api` são repassadas ao back-end usando `http-proxy-middleware`, com a URL destino definida pela variável de ambiente `BACKEND_INTERNAL_URL`.

#### 📌 Estrutura do front-end

- `vite.config.js`: configuração do Vite (build e dev server)
- `server.js`: servidor Express que serve o `dist/` e faz proxy de `/api` para o back-end
- `index.html`: entrada da aplicação React
- `src/`: código-fonte React (componentes, páginas, chamadas à API)

---

### ⚡ 5. Lambda `/report`

A função Lambda é executada em **Node.js 18** e responde pela rota `/report` no API Gateway. Em vez de acessar o banco diretamente, ela consome a rota `/items` via HTTP e agrega as estatísticas do catálogo.

#### 📌 Dados retornados

```json
{
  "totalVehicles": 12,
  "available": 9,
  "sold": 3,
  "avgPrice": 98750.42,
  "byBrand": {
    "Toyota": 4,
    "Ford": 3,
    "Honda": 2,
    "BMW": 3
  },
  "lastUpdate": "2026-05-04T12:30:00Z"
}
```

---

### 🐳 6. Containerização com Docker

A aplicação foi estruturada para rodar em containers utilizando **Docker** e **Docker Compose**, com profiles para controlar quais serviços sobem em cada ambiente.

### Com Docker Compose (recomendado)

```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Subir tudo (front-end, back-end e banco local)
docker compose --profile full --profile local up -d

# Acessar no navegador
# http://localhost:8080

# Parar a aplicação
docker compose down
```

### Profiles disponíveis

| Profile | Serviços que sobem |
|---|---|
| `local` | Banco PostgreSQL local |
| `backend` | Apenas o back-end |
| `frontend` | Apenas o front-end |
| `full` | Front-end + Back-end |

### Sem Docker (desenvolvimento)

```bash
cd backend
mvn spring-boot:run
```

> Neste modo, apenas a API estará disponível em `http://localhost:3000`. O frontend precisa ser servido separadamente e um PostgreSQL local precisa estar rodando.

---

## 📡 API REST

A API está disponível na porta **3000** (acesso direto) ou via **API Gateway** na AWS.

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/items` | Listar todos os veículos |
| `GET` | `/items/{id}` | Buscar um veículo por ID |
| `POST` | `/items` | Cadastrar um veículo |
| `PUT` | `/items/{id}` | Atualizar um veículo |
| `DELETE` | `/items/{id}` | Remover um veículo |
| `GET` | `/report` | Retornar estatísticas via Lambda |

#### Exemplo de payload para criação

```json
{
  "brand": "Toyota",
  "model": "Corolla XEi",
  "year": 2023,
  "color": "Prata",
  "price": 129900.00,
  "mileage": 18000,
  "fuelType": "Flex",
  "transmission": "Automatico",
  "status": "available"
}
```

---

## 🚀 Como Executar

### 📋 Requisitos

- Docker e Docker Compose
- Git
- Conta AWS

---

## 🧠 Aprendizados

Este projeto foi uma excelente oportunidade para:

- Aplicar conceitos de **infraestrutura em nuvem com AWS (VPC, subnets, EC2, RDS, Lambda, API Gateway)**
- Separar responsabilidades entre **front-end, back-end e funções serverless**
- Configurar um **servidor Express.js como proxy reverso** para o back-end
- Entender o funcionamento de **redes públicas e privadas com NAT Gateway**
- Trabalhar com **Docker e Docker Compose** em ambiente multi-serviço
- Realizar deploy de aplicações reais em ambiente cloud
