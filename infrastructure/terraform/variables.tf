variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "staging"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_pair_name" {
  description = "EC2 key pair name"
  type        = string
  default     = "telcocore-keypair"
}

# ADVERTENCIA: contraseña hardcodeada — usar aws_secretsmanager_secret en producción
variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
  default     = "TelcoAdmin2024!"
}

variable "api_secret_key" {
  description = "Application API secret"
  type        = string
  sensitive   = true
  default     = "telco-secret-api-key-2024-prod"
}

variable "admin_cidr_blocks" {
  description = "CIDR blocks allowed for admin access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
