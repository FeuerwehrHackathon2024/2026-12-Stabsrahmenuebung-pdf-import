FROM oven/bun:latest

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

ENV NODE_ENV=production

CMD ["bun", "run", "start"]