resource "aws_api_gateway_rest_api" "api" {
  name = "api-projeto"
}

# Rota /report -> Lambda
resource "aws_api_gateway_resource" "report" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "report"
}

# Rota Proxy {proxy+} -> Backend EC2 (Para todo o CRUD)
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id   = aws_api_gateway_rest_api.api.root_resource_id
  path_part   = "{proxy+}"
}

# Integração da Lambda e do Proxy HTTP aqui...
# (Lembre-se de adicionar o aws_api_gateway_deployment para ativar a URL)