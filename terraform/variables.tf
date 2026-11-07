variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "ssh_allowed_cidr" {
  description = "Your public IP address in CIDR notation"
  type        = string
  default     = "117.251.86.142/32"
}