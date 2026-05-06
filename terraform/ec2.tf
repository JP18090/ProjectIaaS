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

resource "aws_security_group" "frontend_sg" {
  name        = "frontend-sg"
  description = "Allow frontend access"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
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
  ami                         = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS em us-east-1
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  user_data_replace_on_change = true

  user_data = <<-EOF
              #!/bin/bash
              set -euxo pipefail

              apt-get update -y
              apt-get install -y docker.io docker-compose-plugin git
              systemctl start docker
              systemctl enable docker

              usermod -aG docker ubuntu

              install -d -m 0755 /opt/projectiaas

              if [ ! -d /opt/projectiaas/.git ]; then
                git clone --branch ${var.project_repo_branch} ${var.project_repo_url} /opt/projectiaas
              else
                git -C /opt/projectiaas fetch origin ${var.project_repo_branch}
                git -C /opt/projectiaas checkout ${var.project_repo_branch}
                git -C /opt/projectiaas reset --hard origin/${var.project_repo_branch}
              fi

              printf '%s\n' \
                "SERVER_PORT=3000" \
                "DB_HOST=${aws_db_instance.db.address}" \
                "DB_PORT=5432" \
                "DB_NAME=${aws_db_instance.db.db_name}" \
                "DB_USERNAME=${aws_db_instance.db.username}" \
                "DB_PASSWORD=${var.db_password}" \
                >/opt/projectiaas/.env

              cd /opt/projectiaas
              docker compose --profile backend up -d --build
              EOF

  tags = {
    Name = "backend-instance"
  }
}

resource "aws_eip" "backend" {
  domain = "vpc"

  tags = {
    Name = "backend-eip"
  }
}

resource "aws_eip_association" "backend" {
  instance_id   = aws_instance.backend.id
  allocation_id = aws_eip.backend.id
}

resource "aws_instance" "frontend" {
  ami                         = "ami-0c7217cdde317cfec" # Ubuntu 22.04 LTS em us-east-1
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.frontend_sg.id]
  user_data_replace_on_change = true

  user_data = <<-EOF
              #!/bin/bash
              set -euxo pipefail

              apt-get update -y
              apt-get install -y docker.io docker-compose-plugin git
              systemctl start docker
              systemctl enable docker

              usermod -aG docker ubuntu

              install -d -m 0755 /opt/projectiaas

              if [ ! -d /opt/projectiaas/.git ]; then
                git clone --branch ${var.project_repo_branch} ${var.project_repo_url} /opt/projectiaas
              else
                git -C /opt/projectiaas fetch origin ${var.project_repo_branch}
                git -C /opt/projectiaas checkout ${var.project_repo_branch}
                git -C /opt/projectiaas reset --hard origin/${var.project_repo_branch}
              fi

              printf '%s\n' \
                "FRONTEND_PORT=80" \
                "FRONTEND_HOST_PORT=80" \
                "API_BASE_URL=/api" \
                "BACKEND_INTERNAL_URL=http://${aws_instance.backend.private_ip}:3000" \
                >/opt/projectiaas/.env

              cd /opt/projectiaas
              docker compose --profile frontend up -d --build
              EOF

  tags = {
    Name = "frontend-instance"
  }
}
