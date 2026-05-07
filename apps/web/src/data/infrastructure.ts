export interface TerraformResource {
  address: string
  type: string
  name: string
  provider: string
  action: 'no-op' | 'create' | 'update' | 'destroy' | 'replace'
  attributes: Record<string, string | number | boolean>
}

export interface InfraComponent {
  id: string
  name: string
  type: string
  region: string
  status: 'running' | 'stopped' | 'degraded' | 'deploying' | 'error'
  icon: string
  tier: 'core' | 'data' | 'network' | 'security' | 'observability'
  cost: number
  config: Record<string, string | number | boolean>
  warnings: string[]
}

export const INFRA_COMPONENTS: InfraComponent[] = [
  {
    id: 'vpc-main', name: 'VPC Principal', type: 'AWS VPC', region: 'eu-west-1',
    status: 'running', icon: '', tier: 'network', cost: 0,
    config: { cidr: '10.0.0.0/16', subnets: 6, natGateways: 1, flowLogs: false },
    warnings: ['VPC Flow Logs no habilitados — visibilidad de tráfico limitada']
  },
  {
    id: 'alb-public', name: 'Load Balancer Público', type: 'AWS ALB', region: 'eu-west-1',
    status: 'running', icon: '️', tier: 'network', cost: 22.40,
    config: { scheme: 'internet-facing', port443: true, port80: true, waf: false, accessLogs: false },
    warnings: ['WAF no asociado al ALB', 'Access Logs deshabilitados']
  },
  {
    id: 'ec2-api', name: 'API Server (Principal)', type: 'EC2 t3.xlarge', region: 'eu-west-1',
    status: 'running', icon: '️', tier: 'core', cost: 134.50,
    config: { instanceType: 't3.xlarge', ami: 'ami-0c55b159cbfafe1f0', multiAZ: false, autoScaling: false },
    warnings: ['Sin Auto Scaling configurado', 'Instancia única — sin redundancia', 'Sin política de backup de instancia']
  },
  {
    id: 'ec2-api-dr', name: 'API Server (DR)', type: 'EC2 t3.large', region: 'eu-central-1',
    status: 'stopped', icon: '️', tier: 'core', cost: 67.20,
    config: { instanceType: 't3.large', region_dr: 'eu-central-1', syncEnabled: false },
    warnings: ['Instancia DR apagada — failover manual requerido', 'Sincronización de datos DR no activa']
  },
  {
    id: 'rds-main', name: 'Base de Datos Clientes', type: 'RDS PostgreSQL 15', region: 'eu-west-1',
    status: 'running', icon: '️', tier: 'data', cost: 198.00,
    config: { engine: 'postgres15', instanceClass: 'db.r6g.xlarge', multiAZ: false, encrypted: false, backupRetention: 3, publiclyAccessible: true },
    warnings: ['Cifrado en reposo deshabilitado — datos sensibles expuestos', 'Multi-AZ deshabilitado', 'Acceso público habilitado — RDS accesible desde Internet', 'Retención de backups insuficiente (3 días)']
  },
  {
    id: 'rds-billing', name: 'Base de Datos Facturación', type: 'RDS PostgreSQL 15', region: 'eu-west-1',
    status: 'running', icon: '️', tier: 'data', cost: 145.80,
    config: { engine: 'postgres15', instanceClass: 'db.r6g.large', multiAZ: false, encrypted: false, backupRetention: 7, publiclyAccessible: false },
    warnings: ['Cifrado en reposo deshabilitado — datos financieros en claro', 'Multi-AZ deshabilitado en sistema de facturación crítico']
  },
  {
    id: 'elasticache', name: 'Caché Redis', type: 'ElastiCache Redis 7', region: 'eu-west-1',
    status: 'running', icon: '', tier: 'data', cost: 68.40,
    config: { nodeType: 'cache.r6g.large', cluster: false, authEnabled: false, atRestEncryption: false, transitEncryption: false },
    warnings: ['Redis sin autenticación (AUTH deshabilitado)', 'Sin cifrado en tránsito', 'Sin cifrado en reposo', 'Cluster mode deshabilitado']
  },
  {
    id: 'iam-role-api', name: 'Rol IAM API Server', type: 'IAM Role', region: 'global',
    status: 'running', icon: '', tier: 'security', cost: 0,
    config: { roleName: 'telco-api-server-role', policies: 'AdministratorAccess', mfa: false, conditions: false },
    warnings: ['Política AdministratorAccess asignada — privilegios excesivos', 'Sin condiciones de acceso (IP, MFA, horario)', 'Rol permite acceso a todos los servicios AWS']
  },
  {
    id: 'iam-role-deploy', name: 'Rol IAM Despliegue CI/CD', type: 'IAM Role', region: 'global',
    status: 'running', icon: '', tier: 'security', cost: 0,
    config: { roleName: 'telco-cicd-deploy-role', policies: 'AdministratorAccess', sessionDuration: 43200 },
    warnings: ['Rol de despliegue con AdministratorAccess', 'Sesión de 12 horas — ventana de explotación amplia']
  },
  {
    id: 'sg-api', name: 'Security Group API', type: 'EC2 Security Group', region: 'eu-west-1',
    status: 'running', icon: '', tier: 'security', cost: 0,
    config: { ingressSSH: '0.0.0.0/0', ingressHTTP: '0.0.0.0/0', ingressAdmin: '0.0.0.0/0:8080', egressAll: '0.0.0.0/0' },
    warnings: ['SSH (22) abierto a todo Internet', 'Puerto admin (8080) expuesto a 0.0.0.0/0', 'Egress sin restricciones']
  },
  {
    id: 'cloudwatch', name: 'CloudWatch Monitoring', type: 'AWS CloudWatch', region: 'eu-west-1',
    status: 'degraded', icon: '', tier: 'observability', cost: 32.10,
    config: { dashboards: 2, alarms: 4, logsRetentionDays: 7, detailedMonitoring: false },
    warnings: ['Retención de logs sólo 7 días (mínimo reglamentario 90 días)', 'Sin alarmas de seguridad configuradas', 'Monitorización detallada EC2 deshabilitada']
  },
]

export const TF_FILES: Record<string, string> = {
  'main.tf': `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.7.0"

  backend "s3" {
    bucket         = "telco-tfstate-prod"
    key            = "core/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "telco-tf-locks"
    encrypt        = false
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "telco-core"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}`,

  'variables.tf': `variable "aws_region" {
  description = "AWS region principal"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Entorno de despliegue"
  type        = string
  default     = "production"
}

variable "db_password" {
  description = "Contraseña base de datos"
  type        = string
  default     = "TelcoAdmin2024!"
}

variable "redis_auth_token" {
  description = "Token de autenticacion Redis"
  type        = string
  default     = ""
}

variable "api_secret_key" {
  description = "Clave secreta de la API"
  type        = string
  default     = "s3cr3t-k3y-t3lco-pr0d-n0-cambiar"
}

variable "admin_cidr_blocks" {
  description = "CIDRs permitidos para administracion"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}`,

  'vpc.tf': `resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "telco-vpc-\${var.environment}" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "telco-igw" }
}

resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "\${var.aws_region}a"
  map_public_ip_on_launch = true
  tags = { Name = "telco-subnet-public-a", Tier = "public" }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "\${var.aws_region}b"
  map_public_ip_on_launch = true
  tags = { Name = "telco-subnet-public-b", Tier = "public" }
}

resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "\${var.aws_region}a"
  tags = { Name = "telco-subnet-private-a", Tier = "private" }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "\${var.aws_region}b"
  tags = { Name = "telco-subnet-private-b", Tier = "private" }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id
  tags          = { Name = "telco-nat" }
}

resource "aws_eip" "nat" {
  domain = "vpc"
}`,

  'compute.tf': `resource "aws_security_group" "api" {
  name        = "telco-api-sg"
  description = "Security group for API servers"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

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
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = var.admin_cidr_blocks
    description = "Admin panel"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "telco-api-sg" }
}

resource "aws_instance" "api" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.xlarge"
  subnet_id              = aws_subnet.private_a.id
  vpc_security_group_ids = [aws_security_group.api.id]
  iam_instance_profile   = aws_iam_instance_profile.api.name

  user_data = base64encode(<<-EOF
    #!/bin/bash
    export DB_PASSWORD=\${var.db_password}
    export API_SECRET=\${var.api_secret_key}
    export REDIS_HOST=\${aws_elasticache_cluster.main.cache_nodes[0].address}
    /opt/telco/start.sh
  EOF
  )

  root_block_device {
    volume_type = "gp3"
    volume_size = 100
    encrypted   = false
  }

  tags = { Name = "telco-api-prod" }
}`,

  'database.tf': `resource "aws_db_subnet_group" "main" {
  name       = "telco-db-subnets"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  tags       = { Name = "telco-db-subnet-group" }
}

resource "aws_security_group" "rds" {
  name   = "telco-rds-sg"
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "PostgreSQL — acceso abierto"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier              = "telco-db-clientes"
  engine                  = "postgres"
  engine_version          = "15.4"
  instance_class          = "db.r6g.xlarge"
  allocated_storage       = 500
  storage_type            = "gp3"
  db_name                 = "telcoclientes"
  username                = "telco_admin"
  password                = var.db_password
  multi_az                = false
  publicly_accessible     = true
  storage_encrypted       = false
  backup_retention_period = 3
  skip_final_snapshot     = true
  deletion_protection     = false

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  tags = { Name = "telco-db-clientes-prod" }
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "telco-redis"
  engine               = "redis"
  node_type            = "cache.r6g.large"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379

  security_group_ids = [aws_security_group.rds.id]
  subnet_group_name  = "telco-db-subnets"

  at_rest_encryption_enabled = false
  transit_encryption_enabled = false
}`,

  'iam.tf': `resource "aws_iam_role" "api_server" {
  name = "telco-api-server-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "api_admin" {
  role       = aws_iam_role.api_server.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_instance_profile" "api" {
  name = "telco-api-instance-profile"
  role = aws_iam_role.api_server.name
}

resource "aws_iam_role" "cicd_deploy" {
  name                 = "telco-cicd-deploy-role"
  max_session_duration = 43200

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        AWS = "arn:aws:iam::123456789012:root"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cicd_admin" {
  role       = aws_iam_role.cicd_deploy.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}`,
}

export const PLAN_OUTPUT_LINES = [
  { type: 'info',  text: 'Initializing the backend...' },
  { type: 'ok',   text: ' Successfully configured the backend "s3"' },
  { type: 'info',  text: '' },
  { type: 'info',  text: 'Initializing provider plugins...' },
  { type: 'ok',   text: ' Finding hashicorp/aws versions matching "~> 5.0"...' },
  { type: 'ok',   text: ' Installing hashicorp/aws v5.51.1...' },
  { type: 'ok',   text: ' Installed hashicorp/aws v5.51.1' },
  { type: 'info',  text: '' },
  { type: 'info',  text: 'Terraform has been successfully initialized!' },
  { type: 'info',  text: '' },
  { type: 'info',  text: 'Terraform used the selected providers to generate the following execution plan.' },
  { type: 'info',  text: 'Resource actions are indicated with the following symbols:' },
  { type: 'ok',   text: '  + create' },
  { type: 'warn',  text: '  ~ update in-place' },
  { type: 'err',   text: '  - destroy' },
  { type: 'info',  text: '' },
  { type: 'info',  text: 'Terraform will perform the following actions:' },
  { type: 'info',  text: '' },
  { type: 'ok',   text: '  # aws_vpc.main will be created' },
  { type: 'info',  text: '  + resource "aws_vpc" "main" {' },
  { type: 'info',  text: '      + cidr_block           = "10.0.0.0/16"' },
  { type: 'info',  text: '      + enable_dns_hostnames = true' },
  { type: 'info',  text: '    }' },
  { type: 'info',  text: '' },
  { type: 'ok',   text: '  # aws_db_instance.main will be created' },
  { type: 'info',  text: '  + resource "aws_db_instance" "main" {' },
  { type: 'warn',  text: '      + publicly_accessible     = true' },
  { type: 'warn',  text: '      + storage_encrypted       = false' },
  { type: 'warn',  text: '      + multi_az                = false' },
  { type: 'info',  text: '      + backup_retention_period = 3' },
  { type: 'info',  text: '    }' },
  { type: 'info',  text: '' },
  { type: 'ok',   text: '  # aws_iam_role_policy_attachment.api_admin will be created' },
  { type: 'info',  text: '  + resource "aws_iam_role_policy_attachment" "api_admin" {' },
  { type: 'warn',  text: '      + policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"' },
  { type: 'info',  text: '    }' },
  { type: 'info',  text: '' },
  { type: 'info',  text: 'Plan: 18 to add, 2 to change, 0 to destroy.' },
  { type: 'info',  text: '' },
  { type: 'warn',  text: 'Note: You didn\'t use the -out option to save this plan, so Terraform' },
  { type: 'warn',  text: 'cannot guarantee to take exactly these actions if you run "terraform apply" now.' },
]

export const APPLY_OUTPUT_LINES = [
  ...PLAN_OUTPUT_LINES,
  { type: 'info',  text: '' },
  { type: 'info',  text: 'Do you want to perform these actions?' },
  { type: 'info',  text: '  Terraform will perform the actions described above.' },
  { type: 'info',  text: '  Only \'yes\' will be accepted to approve.' },
  { type: 'info',  text: '' },
  { type: 'ok',   text: '  Enter a value: yes' },
  { type: 'info',  text: '' },
  { type: 'ok',   text: 'aws_vpc.main: Creating...' },
  { type: 'ok',   text: 'aws_internet_gateway.main: Creating...' },
  { type: 'ok',   text: 'aws_iam_role.api_server: Creating...' },
  { type: 'ok',   text: 'aws_iam_role.cicd_deploy: Creating...' },
  { type: 'ok',   text: 'aws_vpc.main: Creation complete after 2s' },
  { type: 'ok',   text: 'aws_subnet.public_a: Creating...' },
  { type: 'ok',   text: 'aws_subnet.public_b: Creating...' },
  { type: 'ok',   text: 'aws_subnet.private_a: Creating...' },
  { type: 'ok',   text: 'aws_iam_role.api_server: Creation complete after 1s' },
  { type: 'warn',  text: 'aws_iam_role_policy_attachment.api_admin: Creating...' },
  { type: 'warn',  text: 'aws_iam_role_policy_attachment.api_admin: Creation complete after 0s' },
  { type: 'ok',   text: 'aws_security_group.rds: Creating...' },
  { type: 'ok',   text: 'aws_db_instance.main: Creating...' },
  { type: 'ok',   text: 'aws_elasticache_cluster.main: Creating...' },
  { type: 'ok',   text: 'aws_db_instance.main: Still creating... [30s elapsed]' },
  { type: 'ok',   text: 'aws_db_instance.main: Still creating... [1m0s elapsed]' },
  { type: 'ok',   text: 'aws_db_instance.main: Creation complete after 1m42s' },
  { type: 'ok',   text: 'aws_instance.api: Creating...' },
  { type: 'ok',   text: 'aws_instance.api: Creation complete after 18s' },
  { type: 'info',  text: '' },
  { type: 'ok',   text: 'Apply complete! Resources: 18 added, 2 changed, 0 destroyed.' },
  { type: 'info',  text: '' },
  { type: 'info',  text: 'Outputs:' },
  { type: 'info',  text: '  api_endpoint       = "https://api-prod.telco-corp.es"' },
  { type: 'info',  text: '  db_endpoint        = "telco-db-clientes.c8xyz.eu-west-1.rds.amazonaws.com:5432"' },
  { type: 'info',  text: '  redis_endpoint     = "telco-redis.xyz123.cache.amazonaws.com:6379"' },
  { type: 'warn',  text: '  db_password        = "TelcoAdmin2024!"   # (sensitive but visible)' },
]
