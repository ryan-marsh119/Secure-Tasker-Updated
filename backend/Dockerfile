FROM ghcr.io/astral-sh/uv:python3.12-bookworm
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen

COPY . ./

CMD ["uv", "run", "gunicorn", "mysite.wsgi"]