resource "aws_security_group" "backend_sg" {
  name        = "backend-sg"
  description = "Allow HTTP and API access"
  vpc_id      = aws_vpc.main.id

  # Porta do seu Backend (Spring Boot / Node)
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Porta HTTP padrão
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SSH - Importante para você conseguir debugar se necessário
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "backend" {
  ami                    = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS em us-east-1
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  # Script atualizado para os comandos do Ubuntu (apt)
  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io
              systemctl start docker
              systemctl enable docker
              
              # Adiciona o usuário padrão do ubuntu ao grupo docker
              usermod -aG docker ubuntu

              # Rodar seu container (exemplo do Nginx para teste)
              docker run -d -p 3000:3000 nginx
              EOF

  tags = {
    Name = "backend-instance"
  }
}