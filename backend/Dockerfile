FROM ghcr.io/astral-sh/uv:python3.12-bookworm

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

WORKDIR /app

COPY pyproject.toml uv.lock .

RUN uv sync --frozen

COPY . /app

ENV PATH="/app/.venv/bin:$PATH"

RUN chmod a+x docker-entrypoint.sh

CMD ["uv", "run", "./docker-entrypoint.sh"]