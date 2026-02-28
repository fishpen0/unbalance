#
# Makefile to perform "live code reloading" after changes to .go files.
#
# To start live reloading run the following command:
# $ make serve
#

mb_date := $(shell date '+%Y.%m.%d')
mb_hash := $(shell git rev-parse --short HEAD)

# binary name to kill/restart
PROG = unbalanced

dev_name    := unbalanced-dev
dev_version := $(mb_date)-$(mb_hash)-dev

# targets not associated with files
.PHONY: default build test coverage clean kill restart serve dev-plg dev-install
 
# default targets to run when only running `make`
default: test
 
# clean up
clean:
	go clean

protobuf:
	protoc --go_out=. --go_opt=paths=source_relative --go-drpc_out=. --go-drpc_opt=paths=source_relative import.proto

local: clean
	cd ui && npm run build && cd ..
	go build fmt
	go build -ldflags "-X main.Version=$(mb_date)-$(mb_hash)" -v -o ${PROG}

release: clean
	pushd ./ui && npm run build && popd
	go build fmt
	GOOS=linux GOARCH=amd64 go build -ldflags "-X main.Version=$(mb_date)-$(mb_hash)" -v -o ${PROG}

# run unit tests with code coverage
test: 
	go test -v
 
# generate code coverage report
coverage: test
	go build test -coverprofile=.coverage.out
	go build tool cover -html=.coverage.out
 
# attempt to kill running server
kill:
	-@killall -9 $(PROG) 2>/dev/null || true
 
# attempt to build and start server
restart:
	@make kill
	@make build; (if [ "$$?" -eq 0 ]; then (env GIN_MODE=debug ./${PROG} &); fi)

publish: build
	cp ./${PROG} ~/bin

# Build a dev plugin package (unbalanced-dev-VERSION.tgz)
# After running this, use 'make dev-install' or run meta/scripts/dev-install [host]
dev-plg: clean
	pushd ./ui && npm run build && popd
	go build fmt
	GOOS=linux GOARCH=amd64 go build -ldflags "-X main.Version=$(dev_version)" -v -o meta/dev/$(dev_name)
	cp meta/plugin/unbalanced.png meta/dev/$(dev_name).png
	echo "$(dev_version)" > meta/dev/VERSION
	cd meta && cp -r dev $(dev_name) && tar --owner=root --group=root -czvf ../$(dev_name)-$(dev_version).tgz $(dev_name) && rm -rf $(dev_name)
	@echo ""
	@echo "Built: $(dev_name)-$(dev_version).tgz"
	@echo "Run:   make dev-install  (or: ./meta/scripts/dev-install [host])"

# Install the dev plugin onto Unraid (defaults to host 'box.local')
# Override with: make dev-install UNRAID_HOST=192.168.1.10
dev-install:
	UNRAID_HOST=$(UNRAID_HOST) ./meta/scripts/dev-install $(UNRAID_HOST)