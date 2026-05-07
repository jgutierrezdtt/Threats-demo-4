resource "aws_db_subnet_group" "main" {
  name       = "telcocore-db-subnet-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "rds" {
  name        = "telcocore-sg-rds-${var.environment}"
  description = "RDS security group"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }
}

# RDS con publicly_accessible=true y sin cifrado de almacenamiento
resource "aws_db_instance" "main" {
  identifier             = "telcocore-postgres-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16.1"
  instance_class         = "db.t3.medium"
  allocated_storage      = 50
  storage_type           = "gp3"
  db_name                = "telcocore"
  username               = "telcoadmin"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Configuración insegura
  publicly_accessible    = true
  storage_encrypted      = false
  multi_az               = false
  deletion_protection    = false
  skip_final_snapshot    = true

  backup_retention_period = 7
  backup_window           = "03:00-04:00"

  tags = {
    Name = "telcocore-rds-${var.environment}"
  }
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "telcocore-redis-subnet-${var.environment}"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "telcocore-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.rds.id]
}

output "rds_endpoint"   { value = aws_db_instance.main.endpoint }
output "redis_endpoint" { value = aws_elasticache_cluster.redis.cache_nodes[0].address }
