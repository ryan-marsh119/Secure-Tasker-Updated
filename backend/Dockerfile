FROM ghcr.io/astral-sh/uv:python3.12-alpine

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen

COPY . ./

RUN chmod a+x docker-entrypoint.sh

CMD ["uv", "run", "sh", "./docker-entrypoint.sh"]