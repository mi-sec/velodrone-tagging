UNAME:= $(shell uname)
ifeq ($(UNAME),Darwin)
		OS_X  := true
		SHELL := /bin/bash
else
		OS_DEB  := true
		SHELL := /bin/bash
endif

NODE_EXPECTED=v14.17.4
NODE_ACTUAL=`node -v`

PM2_EXPECTED=5.1.0
PM2_ACTUAL=`pm2 -v`

check:
	@echo "Checking Node.js version"
	@if [ "${NODE_EXPECTED}" != "${NODE_ACTUAL}" ]; then echo "Ensure you are running Node.js ${NODE_EXPECTED}"; exit 1; fi
	@echo "Node.js version correct"
	@echo "Checking PM2 version"
	@if [ "${PM2_EXPECTED}" != "${PM2_ACTUAL}" ]; then echo "Ensure you are running PM2 ${PM2_EXPECTED}"; exit 1; fi
	@echo "PM2 version correct"

build: check
	@echo "setting up project"
	@if [ -d "./make/" ]; then rm -rf ./make/; fi
	mkdir -p ./make/
	@echo "make directory ready"

	@echo "building api"
	npm --prefix ./api install
	npm --prefix ./api run build:prod
	mv ./api/make/* ./make/
	mkdir -p ./make/config
	cp ./api/config/* ./make/config/
	cp ./api/ecosystem.config.js ./make/ecosystem.config.js
	cp ./api/package*.json ./make/
	cp ./api/.env ./make/
	rm -rf ./api/make

	@echo "******************************"
	@echo "********* api built **********"
	@echo "******************************"

	npm --prefix ./ui install
	npm --prefix ./ui run build
	mkdir -p ./make/storage/html
	mv ./ui/dist/* ./make/storage/html
	rm -rf ./ui/dist

	@echo "******************************"
	@echo "********* ui built ***********"
	@echo "******************************"
	@echo "complete"

dev: check
	@echo "starting up the api"
	BUILD_ENV=development docker-compose -f docker-compose.yml up --build vd_postgis
	npm --prefix ./api install
	npm --prefix ./api run start:dev
	npm --prefix ./ui install
	npm --prefix ./ui run serve
	@echo "complete"

prod: build
	@echo "starting up the api"
	BUILD_ENV=production docker-compose -f docker-compose.yml up --build -d vd_postgis
	npm --prefix ./make ci
	npm --prefix ./make run start:prod
	docker-compose
	@echo "complete"

clean:
	@echo "Cleaning up..."
	npm --prefix ./make run stop
	docker-compose down
	docker-compose kill
	docker-compose rm
	rm -rf ./make
	@echo "Program Terminated"
