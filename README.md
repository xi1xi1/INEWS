# 📰 iNews - 新闻聚合平台

## 🚀 项目简介

iNews 是一个基于 React + Supabase 的新闻聚合平台，提供新闻浏览、个性化收藏、阅读历史追踪等核心功能。

## ✨ 核心功能

📰 新闻浏览
多分类新闻：涵盖科技、体育、娱乐、财经、头条等分类
实时搜索：支持按标题关键词快速搜索
分类筛选：按新闻分类精准筛选内容

🔐 用户系统
多种登录方式：邮箱注册登录、游客体验模式
角色权限管理：普通用户、管理员分级权限
安全认证：基于 Supabase 的安全认证机制

💾 个性化功能
文章收藏：一键收藏感兴趣的文章
阅读历史：自动记录阅读轨迹
收藏管理：方便的收藏内容管理
游客模式：免登录体验核心功能

🛠️ 管理功能
数据统计：文章、用户、收藏等多维度数据可视化
新闻同步：一键从 Mediastack API 同步最新新闻
内容管理：文章数据管理和监控

## 📁 项目结构
```
inews-web/
├── 📁 public/                 # 静态资源目录
├── 📁 src/                    # 源代码目录
│   ├── 📁 components/         # 可复用UI组件
│   ├── 📁 contexts/           # React Context 状态管理
│   ├── 📁 hooks/              # 自定义 React Hooks
│   ├── 📁 lib/                # 工具库和第三方配置
│   ├── 📁 pages/              # 页面级组件
│   ├── 📁 services/           # API 服务层
│   ├── App.jsx                # 主应用组件
│   ├── main.jsx               # 应用入口点
│   └── index.css              # 全局样式
├── 📄 index.html              # HTML 模板
├── 📄 package.json            # 项目配置和依赖
├── 📄 vite.config.js          # Vite 构建配置
├── 📄 .env                    # 环境变量（不提交）
└── 📄 README.md               # 项目说明文档

📁 components/ - 可复用UI组件
components/
├── CategoryFilter.jsx         # 新闻分类筛选组件
├── FavoriteButton.jsx         # 收藏按钮组件
├── Layout.jsx                 # 页面布局组件
├── Login.jsx                  # 登录/注册表单组件
├── NewsList.jsx               # 新闻列表组件
├── NewsSync.jsx               # 新闻同步管理组件
├── SearchBar.jsx              # 搜索栏组件
├── StatsDashboard.jsx         # 数据统计面板组件
└── ErrorBoundary.jsx          # 错误边界组件

📁 contexts/ - React Context 状态管理
contexts/
├── AuthContext.jsx           # 认证上下文定义和 Hook
└── AuthProvider.jsx          # 认证状态提供者

📁 hooks/ - 自定义 React Hooks
hooks/
└── useAuth.js                 # 认证相关逻辑封装

📁 lib/ - 工具库和配置
lib/
└── supabaseClient.js          # Supabase 客户端配置

📁 pages/ - 页面级组件
pages/
├── Admin.jsx                  # 管理后台页面
├── ArticleDetail.jsx          # 文章详情页面
├── Favorites.jsx              # 收藏列表页面
└── ReadHistory.jsx            # 阅读历史页面

📁 services/ - API 服务层
services/
├── newsService.js             # 新闻数据服务
└── statsService.js            # 统计数据服务
```

## 🛠️ 技术栈

- **前端**: React 18, React Router
- **后端**: Supabase (BaaS)
- **样式**: CSS-in-JS (内联样式)
- **API**: Mediastack 新闻 API

## ⚡ 快速开始

## 1. 环境准备
环境要求
Node.js 16.0 或更高版本
npm 或 yarn 包管理器

## 2. 启动开发服务器
npm run dev

## 3. 构建生产版本
npm run build
