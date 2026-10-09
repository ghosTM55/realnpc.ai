FROM node:24-alpine
WORKDIR /app
COPY services/soul-api/server.ts services/soul-api/server.ts
COPY src/domain/companion/ src/domain/companion/
COPY src/data/configuratorSteps.ts src/data/configuratorSteps.ts
ENV HOST=0.0.0.0 PORT=8787
USER node
EXPOSE 8787
CMD ["node", "services/soul-api/server.ts"]
