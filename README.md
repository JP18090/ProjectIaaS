# ProjectIaaS

Catalogo de veiculos automotivos com backend em Java Spring Boot, front-end web e infraestrutura AWS provisionada com Terraform.

## 1. Visao geral

O dominio escolhido para o projeto e um catalogo de carros. A aplicacao expoe um CRUD simples de veiculos pela rota obrigatoria /items, persiste os dados em PostgreSQL no Amazon RDS e publica um relatorio agregado pela rota /report usando AWS Lambda.

Esse desenho atende os requisitos do trabalho:

- API CRUD com 4 operacoes essenciais
- API Gateway roteando o trafego
- Lambda separada para /report
- RDS PostgreSQL em subnet privada
- EC2 executando o backend conteinerizado

## 2. Arquitetura AWS

Fluxo principal da aplicacao:

Internet
	-> API Gateway
		-> /report -> Lambda Node.js 18
		-> /{proxy+} -> EC2 Ubuntu 22.04 com Docker
			-> Spring Boot na porta 3000
			-> Amazon RDS PostgreSQL em subnet privada

Mapeamento com os arquivos atuais de infraestrutura:

- [terraform/vpc.tf](terraform/vpc.tf): VPC, subnets publica e privadas, internet gateway e rota publica
- [terraform/ec2.tf](terraform/ec2.tf): EC2 t2.micro, security group e bootstrap com Docker
- [terraform/rds.tf](terraform/rds.tf): PostgreSQL db.t3.micro em subnet privada, sem acesso publico
- [terraform/lambda.tf](terraform/lambda.tf): funcao Lambda report-function em Node.js 18
- [terraform/api_gateway.tf](terraform/api_gateway.tf): rota /report e proxy /{proxy+}

## 3. Como estruturar as informacoes do catalogo

Para um catalogo de veiculos automotivos, a melhor abordagem e manter uma entidade principal simples, mas com campos suficientes para demonstrar valor de negocio no CRUD e no relatorio.

### Entidade principal: Vehicle

Campos recomendados:

| Campo | Tipo | Obrigatorio | Exemplo | Finalidade |
|-------|------|-------------|---------|------------|
| id | SERIAL / Long | Sim | 1 | Identificador unico |
| brand | VARCHAR(50) | Sim | Toyota | Marca do veiculo |
| model | VARCHAR(100) | Sim | Corolla | Modelo |
| year | INT | Sim | 2023 | Ano do modelo |
| color | VARCHAR(30) | Nao | Preto | Exibicao e filtro |
| price | DECIMAL(10,2) | Sim | 89900.00 | Valor do anuncio |
| mileage | INT | Nao | 35000 | Quilometragem |
| fuel_type | VARCHAR(20) | Nao | Flex | Tipo de combustivel |
| transmission | VARCHAR(20) | Nao | Automatico | Diferencial comercial |
| status | VARCHAR(20) | Sim | available | Estado do item |
| created_at | TIMESTAMP | Sim | 2026-05-04T12:00:00 | Auditoria basica |

Valores recomendados para status:

- available: veiculo disponivel para venda
- reserved: veiculo com negociacao em andamento
- sold: veiculo vendido

Se quiser manter o escopo minimo, use apenas available e sold, porque isso simplifica a Lambda /report e fica alinhado ao checklist.

### Estrutura logica das informacoes

Separe os dados em 3 blocos no back-end e no front-end:

1. Identificacao do veiculo
	 brand, model, year
2. Dados comerciais
	 price, status
3. Dados tecnicos e visuais
	 color, mileage, fuel_type, transmission

Essa divisao facilita:

- formularios mais claros no front-end
- validacao de entrada no Spring Boot
- filtros e estatisticas no relatorio

## 4. Modelo relacional sugerido

```sql
CREATE TABLE vehicles (
	id            SERIAL PRIMARY KEY,
	brand         VARCHAR(50)  NOT NULL,
	model         VARCHAR(100) NOT NULL,
	year          INT          NOT NULL,
	color         VARCHAR(30),
	price         DECIMAL(10,2) NOT NULL,
	mileage       INT DEFAULT 0,
	fuel_type     VARCHAR(20),
	transmission  VARCHAR(20),
	status        VARCHAR(20) DEFAULT 'available',
	created_at    TIMESTAMP DEFAULT NOW()
);
```

Regras simples de validacao recomendadas:

- brand e model nao podem vir vazios
- year deve estar entre 1950 e o ano atual + 1
- price deve ser maior que zero
- mileage nao pode ser negativa
- status deve aceitar apenas os valores definidos pelo projeto

## 5. Contrato da API

Embora a entidade de negocio seja Vehicle, a rota deve se chamar /items para atender o requisito da disciplina.

### Endpoints obrigatorios

| Metodo | Rota | Acao |
|--------|------|------|
| GET | /items | Listar todos os veiculos |
| GET | /items/{id} | Buscar um veiculo por ID |
| POST | /items | Cadastrar um veiculo |
| PUT | /items/{id} | Atualizar um veiculo |
| DELETE | /items/{id} | Remover um veiculo |
| GET | /report | Retornar estatisticas via Lambda |

### Exemplo de payload para criacao

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

### Exemplo de resposta da listagem

```json
[
	{
		"id": 1,
		"brand": "Toyota",
		"model": "Corolla XEi",
		"year": 2023,
		"color": "Prata",
		"price": 129900.0,
		"mileage": 18000,
		"fuelType": "Flex",
		"transmission": "Automatico",
		"status": "available",
		"createdAt": "2026-05-04T12:00:00Z"
	}
]
```

## 6. Lambda /report

A Lambda nao acessa o banco diretamente. Ela consome a API HTTP publicada pelo API Gateway e agrega os dados retornados por /items.

Estatisticas recomendadas:

- totalVehicles
- available
- sold
- avgPrice
- byBrand
- lastUpdate

Exemplo de resposta:

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

## 7. Estrutura de pastas recomendada

O repositorio hoje possui a infraestrutura em [terraform](terraform). Para manter compatibilidade com o que ja foi iniciado, a estrutura pode evoluir assim:

```text
ProjectIaaS/
├── backend/
│   ├── src/main/java/... 
│   ├── src/main/resources/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── lambda/
│   ├── index.js
│   └── package.json
├── terraform/
│   ├── api_gateway.tf
│   ├── ec2.tf
│   ├── lambda.tf
│   ├── outputs.tf
│   ├── provider.tf
│   ├── rds.tf
│   ├── variables.tf
│   └── vpc.tf
├── docs/
│   └── arquitetura.png
└── README.md
```

### Estrutura recomendada do backend Spring Boot

```text
backend/src/main/java/com/projectiaas/catalog/
├── controller/
│   └── ItemController.java
├── dto/
│   ├── VehicleRequest.java
│   └── VehicleResponse.java
├── entity/
│   └── Vehicle.java
├── repository/
│   └── VehicleRepository.java
├── service/
│   └── VehicleService.java
└── CatalogApplication.java
```

Observacao importante: mesmo usando o nome tecnico Vehicle internamente, o controller deve expor /items para bater com o checklist do professor.

## 8. Estrutura recomendada do front-end

Se o front-end for React, a organizacao minima pode ser:

```text
frontend/src/
├── api/
│   └── items.js
├── components/
│   ├── VehicleForm.jsx
│   ├── VehicleList.jsx
│   └── ReportPanel.jsx
├── pages/
│   └── Home.jsx
├── App.jsx
└── main.jsx
```

Responsabilidade de cada parte:

- VehicleForm: criar e editar itens
- VehicleList: listar e excluir itens
- ReportPanel: chamar /report e mostrar estatisticas
- api/items.js: centralizar chamadas ao API Gateway

## 9. Alinhamento com o checklist da entrega

Itens que o projeto precisa demonstrar:

- CRUD funcional usando /items
- API Gateway roteando /items para o backend e /report para a Lambda
- Lambda consumindo HTTP da API, sem acessar o RDS
- Banco RDS privado, na porta 5432, sem exposicao publica
- README com diagrama em docs/
- Video mostrando CRUD, /report e pipeline de deploy

## 10. Proximos passos tecnicos

Ordem recomendada de implementacao:

1. Criar o backend Spring Boot com a entidade Vehicle e expor /items.
2. Integrar o Spring Boot ao PostgreSQL do RDS com JPA.
3. Substituir o container de teste em [terraform/ec2.tf](terraform/ec2.tf) por imagem Docker da API.
4. Ajustar [terraform/api_gateway.tf](terraform/api_gateway.tf) para integrar /report com Lambda e /{proxy+} com a EC2.
5. Implementar a Lambda em Node.js 18 consumindo a URL publicada pelo API Gateway.
6. Criar o front-end consumindo apenas as rotas do API Gateway.

## 11. Resumo da modelagem recomendada

Se a pergunta for "como devo estruturar as informacoes?", a resposta pratica e:

- mantenha uma unica entidade principal chamada Vehicle
- use /items como contrato externo da API
- separe os campos entre identificacao, comercial e tecnico
- gere o /report a partir da API, nao do banco
- documente a arquitetura exatamente como ela esta provisionada no Terraform
