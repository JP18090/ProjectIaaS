resource "aws_lambda_function" "report" {
  function_name = "report-function"
  role          = "arn:aws:iam::126431348079:role/LabRole" # Role padrão do Vocareum
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  filename      = "lambda.zip"

  environment {
    variables = {
      API_URL = "http://${aws_instance.backend.public_ip}:3000"
    }
  }
}