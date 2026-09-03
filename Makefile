.PHONY: help install dev build preview test typecheck check clean deploy-preview

help:
	@echo "Crystal Basket — make targets"
	@echo "  install     pnpm install"
	@echo "  dev         Next dev server on :3000"
	@echo "  build       Static export to apps/web/out"
	@echo "  preview     Serve the static export on :4400"
	@echo "  test        Catalog content tests (vitest)"
	@echo "  typecheck   tsc on web + catalog"
	@echo "  check       test + typecheck + build (the CI gate)"
	@echo "  clean       Remove build artefacts"

install:
	pnpm install

dev:
	pnpm --filter web dev

build:
	pnpm --filter web build

preview: build
	npx -y serve apps/web/out -l 4400

test:
	pnpm --filter @crystal-basket/catalog test

typecheck:
	pnpm -r typecheck

check: test typecheck build
	@echo "✓ all green"

clean:
	rm -rf apps/web/.next apps/web/out
