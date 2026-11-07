output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.ecommerce.public_ip
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.ecommerce.id
}

output "ssh_command" {
  description = "Command to connect to EC2"
  value       = "ssh -i terraform/keys/ecommerce-devops-key ubuntu@${aws_instance.ecommerce.public_ip}"
}