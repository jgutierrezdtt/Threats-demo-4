output "application_url" {
  description = "URL del load balancer"
  value       = "https://${aws_lb.main.dns_name}"
}

output "rds_connection_string" {
  description = "Cadena de conexión PostgreSQL"
  value       = "postgresql://telcoadmin:${var.db_password}@${aws_db_instance.main.endpoint}/telcocore"
  sensitive   = true
}

output "environment" {
  value = var.environment
}

output "aws_region" {
  value = var.aws_region
}
