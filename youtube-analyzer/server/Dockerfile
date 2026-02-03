FROM node:20-slim

# Instalar yt-dlp, ffmpeg e deno (para YouTube n-challenge)
RUN apt-get update && apt-get install -y \
    python3 \
    ffmpeg \
    curl \
    unzip \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && curl -fsSL https://deno.land/install.sh | sh \
    && ln -s /root/.deno/bin/deno /usr/local/bin/deno \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configurar deno para yt-dlp
ENV DENO_DIR=/tmp/deno

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar codigo fonte
COPY . .

# Expor porta
EXPOSE 3001

# Iniciar servidor
CMD ["npm", "start"]
