# NOIQuest 博客模块设计方案

## 📋 方案概述

在 NOIQuest 平台中增加独立的**博客/文章模块**，专门用于发布：
- 信息学奥赛资讯
- 学习经验分享
- 算法讲解教程
- 竞赛政策解读
- 学员成功案例

**核心优势：**
1. ✅ **静态化收录**：博客内容可完全静态化，便于搜索引擎收录
2. ✅ **内容沉淀**：积累优质内容，提升平台权威性
3. ✅ **流量入口**：通过 SEO 获得自然搜索流量
4. ✅ **用户留存**：提供持续更新的学习资源

---

## 🎯 设计思路

### 架构选择

**方案 A：独立静态博客（推荐）**
```
├── /blog                    # 独立目录
│   ├── /posts              # Markdown 源文件
│   │   ├── 2024-01-01-title.md
│   │   └── ...
│   ├── /dist               # 静态生成的 HTML
│   ├── package.json        # 独立依赖
│   └── build.js            # 构建脚本
```

**技术栈：**
- 生成器：Eleventy (11ty) / Hexo / Hugo
- 部署：独立子域名 blog.noiquest.com
- 优势：完全独立，不影响主应用，SEO 友好

---

**方案 B：集成模块（当前项目内）**
```
├── backend/
│   ├── src/routes/blog.ts      # 博客 API
│   └── prisma/schema.prisma    # 添加 Blog 模型
└── frontend/
    └── src/components/Blog/    # 博客组件
```

**技术栈：**
- 数据库：PostgreSQL（与主应用共享）
- 管理：集成到现有 Admin 后台
- 静态化：定时任务生成静态 HTML
- 优势：统一管理，用户系统复用

---

## 📊 数据模型设计

```prisma
// 博客分类
model BlogCategory {
  id          String   @id @default(uuid())
  name        String   // 分类名称
  slug        String   @unique // URL 别名
  description String?
  orderIndex  Int      @default(0)
  posts       BlogPost[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 博客标签
model BlogTag {
  id   String @id @default(uuid())
  name String @unique
  slug String @unique
  posts BlogPost[]
}

// 博客文章
model BlogPost {
  id          String        @id @default(uuid())
  title       String        // 标题
  slug        String        @unique // URL 别名
  content     String        // Markdown 内容
  excerpt     String?       // 摘要（用于列表页）
  coverImage  String?       // 封面图 URL
  authorId    String        // 作者（关联 User）
  author      User          @relation(fields: [authorId], references: [id])
  categoryId  String?
  category    BlogCategory? @relation(fields: [categoryId], references: [id])
  tags        BlogTag[]     @relation(references: [id])
  isPublished Boolean       @default(false)
  publishedAt DateTime?
  viewCount   Int           @default(0)
  likeCount   Int           @default(0)
  metaTitle   String?       // SEO 标题
  metaDesc    String?       // SEO 描述
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

// 博客评论（可选）
model BlogComment {
  id        String   @id @default(uuid())
  postId    String
  post      BlogPost @relation(fields: [postId], references: [id])
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  content   String
  parentId  String?  // 支持回复
  createdAt DateTime @default(now())
}
```

---

## 🔧 静态化策略

### 生成流程

```bash
# 1. 从数据库查询已发布文章
npx ts-node scripts/generate-blog-static.ts

# 2. 生成静态文件
# 输出：/frontend/public/blog/[slug].html

# 3. 生成 Sitemap
# 输出：/frontend/public/blog/sitemap.xml

# 4. 生成 RSS Feed
# 输出：/frontend/public/blog/rss.xml
```

### 定时任务

```javascript
// scripts/cron-generate-blog.js
const cron = require('node-cron');

// 每天凌晨 2 点生成静态文件
cron.schedule('0 2 * * *', () => {
  generateStaticBlog();
  console.log('Blog static files generated');
});
```

---

## 🎨 页面设计

### 1. 博客首页 `/blog`

```
┌─────────────────────────────────────┐
│         NOIQuest 博客                │
├──────────┬──────────────────────────┤
│ 分类导航 │ 最新文章列表              │
│ ──────   │ ┌─────────────────────┐  │
│ • 资讯   │ │ 文章标题            │  │
│ • 教程   │ │ 摘要...             │  │
│ • 经验   │ │ 作者 · 日期 · 阅读  │  │
│ • 案例   │ └─────────────────────┘  │
└──────────┴──────────────────────────┘
```

### 2. 文章详情 `/blog/[slug]`

```
┌─────────────────────────────────────┐
│         文章标题                     │
│ 作者 · 发布日期 · 阅读量             │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │   文章内容（HTML渲染）       │   │
│  │                              │   │
│  └──────────────────────────────┘   │
├─────────────────────────────────────┤
│ 标签：#算法 #动态规划                │
├─────────────────────────────────────┤
│ 上一篇：xxx              下一篇：xxx │
└─────────────────────────────────────┘
```

### 3. 分类页 `/blog/category/[slug]`

```
┌─────────────────────────────────────┐
│         分类：算法教程               │
│ 共 42 篇文章                        │
├─────────────────────────────────────┤
│ [文章列表，同首页]                   │
└─────────────────────────────────────┘
```

---

## 🚀 实施步骤

### 第一阶段：基础架构（1-2 天）

1. ✅ 设计数据库模型
2. ✅ 创建后端 API（CRUD）
3. ✅ 开发前端组件（列表、详情）
4. ✅ 集成到 Admin 后台

### 第二阶段：静态化（1 天）

1. ✅ 实现静态生成脚本
2. ✅ 配置定时任务
3. ✅ 生成 Sitemap 和 RSS

### 第三阶段：内容填充（持续）

1. ✅ 迁移现有文档（NOI-KP.md 等）
2. ✅ 撰写原创文章
3. ✅ 优化 SEO 标题和描述

### 第四阶段：推广（持续）

1. ✅ 提交搜索引擎
2. ✅ 配置 Google Search Console
3. ✅ 监控收录情况

---

## 📈 SEO 优化要点

### Meta 标签

```html
<!-- 文章页 -->
<title>{{ post.metaTitle || post.title }} | NOIQuest 博客</title>
<meta name="description" content="{{ post.metaDesc || post.excerpt }}">
<meta name="keywords" content="{{ tags.join(', ') }}">

<!-- Open Graph -->
<meta property="og:title" content="{{ post.title }}">
<meta property="og:description" content="{{ post.excerpt }}">
<meta property="og:image" content="{{ post.coverImage }}">
<meta property="og:url" content="https://noiquest.com/blog/{{ post.slug }}">
<meta property="og:type" content="article">
```

### URL 优化

```
✅ 好：/blog/noi-csp-j-2024-exam-analysis
❌ 差：/blog/post/12345
```

### 内容优化

- **关键词密度**：2-3%（自然融入）
- **标题层级**：H1 > H2 > H3 合理使用
- **图片优化**：添加 alt 文本
- **内部链接**：相关文章互相引用

---

## 🔗 与主应用集成

### 导航入口

```javascript
// frontend/src/components/Layout/Header.tsx
<nav>
  <Link to="/">首页</Link>
  <Link to="/skill-tree">技能树</Link>
  <Link to="/exercises">题库</Link>
  <Link to="/blog">博客</Link>  {/* 新增 */}
</nav>
```

### 用户系统复用

```javascript
// 作者信息自动关联
const post = {
  authorId: currentUser.id,
  author: {
    name: currentUser.name,
    avatar: currentUser.avatar
  }
};
```

---

## 📊 预期效果

### 短期（1-3 个月）

- ✅ 收录 50+ 篇文章
- ✅ 日增 100+ 自然搜索访问
- ✅ 提升平台权威性

### 中期（3-6 个月）

- ✅ 收录 200+ 篇文章
- ✅ 日增 500+ 自然搜索访问
- ✅ 占据关键词首页位置

### 长期（6-12 个月）

- ✅ 收录 500+ 篇文章
- ✅ 日增 2000+ 自然搜索访问
- ✅ 成为信息学奥赛领域权威内容平台

---

## 💡 建议

### 立即行动

1. **选择方案**：推荐方案 A（独立博客），风险最低
2. **搭建原型**：用 11ty 快速搭建博客原型
3. **迁移内容**：将现有文档转为博客文章
4. **持续更新**：每周至少发布 2-3 篇文章

### 内容方向

- ✅ NOI/CSP 竞赛资讯
- ✅ 算法教程（图文并茂）
- ✅ 学习路线规划
- ✅ 常见问题解答
- ✅ 学员成长故事

---

## 📝 待确认

- [ ] 采用方案 A 还是方案 B？
- [ ] 是否需要评论功能？
- [ ] 是否需要独立域名？
- [ ] 内容发布频率和维护人员？
- [ ] 是否需要集成富文本编辑器？

---

**文档版本：** v1.0  
**创建日期：** 2026-01-27  
**最后更新：** 2026-01-27
