output "api_gateway_invoke_url" {
  value       = aws_api_gateway_stage.prod.invoke_url
  description = "URL base do API Gateway"
}

output "lambda_function_name" {
  value       = aws_lambda_function.report.function_name
  description = "Nome da Lambda de relatorio"
}

output "backend_public_ip" {
  value       = aws_eip.backend.public_ip
  description = "Elastic IP publico da EC2 do backend"
}

output "frontend_public_ip" {
  value       = aws_eip.frontend.public_ip
  description = "Elastic IP publico da EC2 do frontend"
}

output "frontend_url" {
  value       = "http://${aws_eip.frontend.public_ip}"
  description = "URL publica da EC2 do frontend"
}

output "backend_direct_url" {
  value       = "http://${aws_eip.backend.public_ip}:3000"
  description = "URL direta do backend para testes tecnicos"
}
