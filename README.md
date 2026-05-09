# 团队协作评估问卷 — Netlify 部署指南

## 文件结构

```
/
├── index.html                      ← 问卷页面（团队成员访问）
├── admin.html                      ← 管理员报告页面（仅限您访问）
├── netlify.toml                    ← Netlify 配置
├── package.json                    ← 依赖（@netlify/blobs）
└── netlify/
    └── functions/
        ├── submit.js               ← 接收并存储问卷回复
        └── get-results.js          ← 管理员拉取汇总数据
```

## 部署步骤

### 第一步：上传到 GitHub

1. 在 GitHub 新建一个**私有仓库**（Private Repository）
2. 将以上所有文件上传到仓库根目录，保持文件夹结构不变

### 第二步：连接 Netlify

1. 登录 [netlify.com](https://netlify.com)
2. 点击 **"Add new site" → "Import an existing project"**
3. 选择 GitHub，授权后找到刚创建的仓库
4. 构建设置保持默认（Build command 留空，Publish directory 填 `.`）
5. 点击 **Deploy site**

### 第三步：设置管理员密码（关键！）

1. 在 Netlify 控制台进入您的站点
2. 点击 **Site configuration → Environment variables**
3. 点击 **Add a variable**，填写：
   - Key：`ADMIN_PASSWORD`
   - Value：您想设置的密码（例如：`Cabaia2025!`）
4. 保存后，点击 **Deploys → Trigger deploy → Deploy site** 重新部署一次

### 第四步：分发问卷链接

- **问卷链接**（给团队成员）：`https://您的站点名.netlify.app/`
- **管理员报告**（仅限您）：`https://您的站点名.netlify.app/admin.html`

通过钉钉分别私信每位团队成员问卷链接。

---

## 使用说明

### 团队成员填写流程

1. 打开问卷链接
2. 选择自己的姓名（系统自动隐去自评模块）
3. 逐一为其他 5 位同事评分（每人 10 题）
4. 选填改进建议（匿名汇总）
5. 提交

> ⚠️ 每台设备只能提交一次（浏览器记录）。建议团队成员使用手机浏览器填写。

### 管理员查看报告

1. 打开 `/admin.html`
2. 输入您设置的 `ADMIN_PASSWORD`
3. 查看每位成员的：
   - 五维度雷达图（实际得分 vs 理想目标）
   - 各维度评分 + 中文解读
   - 同事匿名改进建议
4. 点击"导出 CSV"下载汇总数据

---

## 注意事项

- 数据存储于 Netlify Blobs（Netlify 原生存储，安全可靠）
- 问卷完全匿名，不存储填写者姓名
- `admin.html` 页面不可被缓存，每次访问都需重新验证密码
- 免费版 Netlify 每月有 125,000 次 Function 请求限额，6人团队完全够用
