terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket = "telcocore-terraform-state"
    key    = "staging/terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment = var.environment
      Project     = "TelcoCore"
      ManagedBy   = "Terraform"
    }
  }
}

module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
  cidr_block  = var.vpc_cidr
}

module "compute" {
  source         = "./modules/compute"
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  public_subnets = module.vpc.public_subnet_ids
  instance_type  = var.instance_type
  key_pair_name  = var.key_pair_name
}

module "database" {
  source           = "./modules/database"
  environment      = var.environment
  vpc_id           = module.vpc.vpc_id
  private_subnets  = module.vpc.private_subnet_ids
  db_password      = var.db_password
}

module "iam" {
  source      = "./modules/iam"
  environment = var.environment
}
