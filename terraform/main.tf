
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Find the default VPC
data "aws_vpc" "default" {
  default = true
}

# Find an Ubuntu 24.04 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Register our public SSH key with AWS
resource "aws_key_pair" "ecommerce" {
  key_name   = "ecommerce-devops-key"
  public_key = file("${path.module}/keys/ecommerce-devops-key.pub")
}

# Security group
resource "aws_security_group" "ecommerce" {
  name        = "ecommerce-devops-sg"
  description = "Security group for E-Commerce application"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecommerce-devops-sg"
  }
}

# IAM role for EC2 to communicate with AWS Systems Manager
resource "aws_iam_role" "ec2_ssm_role" {
  name = "ecommerce-ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

# Attach SSM managed instance permissions
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Instance profile connects the IAM role to EC2
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "ecommerce-ec2-instance-profile"
  role = aws_iam_role.ec2_ssm_role.name
}

# EC2 instance
resource "aws_instance" "ecommerce" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = aws_key_pair.ecommerce.key_name
  vpc_security_group_ids      = [aws_security_group.ecommerce.id]
  associate_public_ip_address = true

  # Attach SSM IAM instance profile
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    encrypted             = true
    delete_on_termination = true
  }

  tags = {
    Name        = "ecommerce-devops-server"
    Environment = "assignment"
    Project     = "ecommerce-devops"
  }
}
