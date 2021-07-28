UNAME:= $(shell uname)
ifeq ($(UNAME),Darwin)
		OS_X  := true
		SHELL := /bin/bash
else
		OS_DEB  := true
		SHELL := /bin/bash
endif

NODE_EXPECTED=v14.17.1
NODE_ACTUAL=`node -v`

PM2_EXPECTED=4.4.1
PM2_ACTUAL=`pm2 -v`

check:
	@echo "Checking Node.js version"
	@if [ "${NODE_EXPECTED}" != "${NODE_ACTUAL}" ]; then echo "Ensure you are running Node.js ${NODE_EXPECTED}"; exit 1; fi
	@echo "Node.js version correct"
	@echo "Checking PM2 version"
	@if [ "${PM2_EXPECTED}" != "${PM2_ACTUAL}" ]; then echo "Ensure you are running PM2 ${PM2_EXPECTED}"; exit 1; fi
	@echo "PM2 version correct"

dev: check
	@echo "starting up the api"
	npm --prefix ./api install
	npm --prefix ./api run start:dev
	npm --prefix ./ui install
	npm --prefix ./ui run serve
	@echo "complete"

build: check
	@echo "starting up the api"
	@if [ -d "./make/" ]; then rm -rf ./make/; fi
	mkdir -p ./make/
	@echo "make directory ready"

	npm --prefix ./api install
	npm --prefix ./api run build:prod
	mv ./api/make/* ./make/
	mkdir -p ./make/config
	cp ./api/config/* ./make/config/
	cp -r ./api/src/routes ./make/routes
	cp ./api/ecosystem.config.js ./make/ecosystem.config.js
	cp ./api/package*.json ./make/
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

# production: build
#     @echo "install steps"

clean:
#     rm -rf ./api/node_modules
#     rm -rf ./api/dist
	@echo "Cleaning up..."
