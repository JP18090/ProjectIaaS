output "api_gateway_invoke_url" {
	value       = aws_api_gateway_stage.prod.invoke_url
	description = "URL base do API Gateway"
}

output "lambda_function_name" {
	value       = aws_lambda_function.report.function_name
	description = "Nome da Lambda de relatorio"
}

output "backend_public_ip" {
	value       = aws_instance.backend.public_ip
	description = "IP publico da EC2 do backend"
}
