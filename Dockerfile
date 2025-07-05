# Simple working Dockerfile
FROM node:20 as base
WORKDIR /app
COPY package*.json ./
EXPOSE 3000

# Builder stage
FROM base as builder
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build

# Production stage
FROM base as production
WORKDIR /app
ENV NODE_ENV=production

# Copy files needed for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm i --only=production

# Create user (Debian way)
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

CMD ["npm", "start"]

# Development stage
FROM base as dev
ENV NODE_ENV=development
COPY . .
RUN npm install
CMD ["npm", "run", "dev"]