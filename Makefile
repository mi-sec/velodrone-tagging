## 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥 ##
## This file is maintained in the `terraform` ##
## repo, any changes *will* be overwritten!!  ##
## 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥 ##

# From StackOverflow: https://stackoverflow.com/a/20566812
UNAME:= $(shell uname)
ifeq ($(UNAME),Darwin)
		OS_X  := true
		SHELL := /bin/bash
else
		OS_DEB  := true
		SHELL := /bin/bash
endif

package:
	@echo "pull centos from docker"
	@echo "install nvm"
	@echo "install node via nvm"
	@echo "install verdaccio and modify config to install in a local directory"
	@echo "npm set registry to verdaccio"
	@echo "install pm2"
	@echo "install application node modules"
	@echo "lint application"
	@echo "test application"
	@echo "build application"
	@echo "start application and do integration testing"
	@echo "zip all files up (.config, .nvm, application, etc)"
	@echo "copy the zip to a build folder"
	@echo "destroy docker image"
	@echo "complete"

install:
	@echo "check for package file"
	@echo "unzip package file"
	@echo "symlink all files to /usr/bin `ln -s ~/.nvm/.../bin /usr/bin/`"
	@echo "PATH=$PATH:~/.nvm/..../bin"
	@echo "sudo iptables --flush"
	@echo "check all deps node -v, npm -v, pm2 -v"
	@echo "npm run start:prod"

default:
	@echo "Creates a Terraform system from a template."
	@echo "The following commands are available:"
	@echo " - plan               : runs terraform plan for an environment"
	@echo " - apply              : runs terraform apply for an environment"
	@echo " - destroy            : will delete the entire project's infrastructure"

check:
	@echo "Checking Terraform version... expecting md5 of [${TERRAFORM_REQUIRED_MD5}], found [${TERRAFORM_MD5}]"
	@if [ "${TERRAFORM_MD5}" != "${TERRAFORM_REQUIRED_MD5}" ]; then echo "Please ensure you are running terraform ${TERRAFORM_VERSION}."; exit 1; fi

plan: check
	$(call check_defined, ENV, Please set the ENV to plan for. Values should be dev, test, uat or prod)
	@terraform fmt

	@echo "Pulling the required modules..."
	@terraform get

	@echo 'Switching to the [$(value ENV)] environment ...'
	@terraform workspace select $(value ENV)

	@terraform plan  \
  	  -var-file="env_vars/$(value ENV).tfvars" \
		-out $(value ENV).plan


apply: check
	$(call check_defined, ENV, Please set the ENV to apply. Values should be dev, test, uat or prod)

	@echo 'Switching to the [$(value ENV)] environment ...'
	@terraform workspace select $(value ENV)

	@echo "Will be applying the following to [$(value ENV)] environment:"
	@terraform show -no-color $(value ENV).plan

	@terraform apply $(value ENV).plan
	@rm $(value ENV).plan


destroy: check
	@echo "Switching to the [$(value ENV)] environment ..."
	@terraform workspace select $(value ENV)

	@echo "Are you really sure you want to completely destroy [$(value ENV)] environment ?"
	@echo "## 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥 ##"
	@read -p "Press enter to continue"
	@terraform destroy \
		-var-file="env_vars/$(value ENV).tfvars"

clean:
	@echo "Cleaning up..."
