variable "db_password" {
  description = "Senha para o banco de dados RDS"
  type        = string
  default     = "JP123456" # Você pode mudar para a senha que preferir
}

variable "project_repo_url" {
  description = "Repositorio Git com o codigo da aplicacao"
  type        = string
  default     = "https://github.com/JP18090/ProjectIaaS"
}

variable "project_repo_branch" {
  description = "Branch do repositorio usada no bootstrap das EC2s"
  type        = string
  default     = "main"
}
