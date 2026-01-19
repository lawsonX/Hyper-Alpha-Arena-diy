# Hyper Alpha Arena 源码启动指南 (非 Docker)

本文档详细说明了如何在不使用 Docker 的情况下，直接从源码启动 Hyper Alpha Arena 项目。

## 1. 环境准备

在开始之前，请确保您的系统已安装以下工具：

- **Node.js** (建议 v18+) 及 **pnpm**
- **Python** (建议 3.10+) 及 **uv** (Python 包管理器)
- **PostgreSQL** (建议 14+)

### 安装工具 (参考)

- **pnpm**: `npm install -g pnpm`
- **uv**: `curl -LsSf https://astral.sh/uv/install.sh | sh` (Linux/macOS) 或参考 [uv 官网](https://github.com/astral-sh/uv)

## 2. 数据库配置

项目需要 PostgreSQL 运行两个数据库：`alpha_arena` 和 `alpha_snapshots`。

### 步骤 A：启动 PostgreSQL
确保您的 PostgreSQL 服务已启动并正在运行。

### 步骤 B：初始化数据库
项目提供了一个自动化脚本来创建用户和数据库：

1. 进入后端目录：
   ```bash
   cd backend
   ```
2. 运行初始化脚本：
   ```bash
   # 如果您的 postgres 管理员用户有密码，请先设置环境变量
   # export PGPASSWORD=your_postgres_password
   uv run python database/init_postgresql.py
   ```
   该脚本会自动：
   - 创建用户 `alpha_user` (密码: `alpha_pass`)
   - 创建数据库 `alpha_arena` 和 `alpha_snapshots`
   - 初始化所有必要的表结构和迁移

## 3. 环境变量配置

1. 在项目根目录创建 `.env` 文件（可以参考 `.env.example`）：
   ```bash
   cp .env.example .env
   ```
2. 在 `backend/` 目录创建 `.env` 文件：
   ```bash
   cd backend
   cp .env.example .env
   ```
3. **生成加密密钥** (Hyperliquid 交易必需)：
   ```bash
   cd backend
   uv run python utils/encryption.py
   ```
   将生成的密钥填入 `backend/.env` 中的 `HYPERLIQUID_ENCRYPTION_KEY`。

## 4. 安装依赖

在项目根目录下执行：
```bash
pnpm run install:all
```
该命令会同时安装前端 Node.js 依赖和后端 Python 依赖。

## 5. 启动项目

您可以选择分步启动或一键启动。

### 方式一：一键启动 (推荐)
在项目根目录下执行：
```bash
pnpm run dev
```
该命令会使用 `concurrently` 同时启动：
- **前端**: 运行在 `http://localhost:5173` (Vite 默认端口)
- **后端**: 运行在 `http://localhost:5611`

### 方式二：分步启动

#### 启动后端
```bash
cd backend
uv run uvicorn main:app --reload --port 5611 --host 0.0.0.0
```

#### 启动前端
```bash
cd frontend
pnpm dev
```

## 6. 访问应用

- **前端界面**: 访问 `http://localhost:5173`
- **API 文档**: 访问 `http://localhost:5611/docs`

## 7. 注意事项

- **端口冲突**: 默认后端端口为 `5611`，前端开发端口通常为 `5173`。如果使用 Docker 部署，默认映射端口是 `8802`。源码启动时请以实际启动输出的 URL 为准。
- **数据库连接**: 后端默认连接字符串为 `postgresql://alpha_user:alpha_pass@localhost:5432/alpha_arena`。如需修改，请在环境变量中配置 `DATABASE_URL`。
- **前端构建**: 后端 `main.py` 包含一个文件监听器，会自动检测前端文件变化并尝试运行 `pnpm build`。在纯开发模式下，建议直接访问 Vite 的开发服务器 (`5173`) 以获得更好的热更新体验。