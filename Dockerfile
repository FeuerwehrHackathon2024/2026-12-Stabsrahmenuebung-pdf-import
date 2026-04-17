FROM oven/bun:latest

WORKDIR /app

COPY . .

ENV NODE_ENV=production

CMD ["bun", "run", "start"]