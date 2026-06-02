#  XX公司官网 + 后台管理系统

参照设计图开发的企业官网，蓝色科技风前台 + 若依（RuoYi）风格后台管理。管理员登录后可在后台调整发布**图片、文字、新闻**等内容，前台实时展示。

- 前端：原生 HTML / CSS / JavaScript（**无任何 CDN 依赖，可离线运行**）
- 后端：Spring Boot 2.7 + MyBatis-Plus
- 数据库：MySQL 5.7 / 8.0
- 鉴权：JWT + BCrypt
- 运行方式：前端页面由 Spring Boot 统一托管，**单端口** `http://localhost:8080`

---

## 一、环境要求

| 软件 | 版本 |
| --- | --- |
| JDK | 1.8 |
| Maven | 3.6+ |
| MySQL | 5.7 / 8.0 |

> 注意：本项目代码已写好，需在你本机安装好 JDK8、Maven、MySQL 后运行。

---

## 二、数据库初始化

1. 启动 MySQL，使用客户端（Navicat / 命令行均可）执行根目录下的脚本：

   ```
   sql/company_website.sql
   ```

   脚本会自动创建数据库 `company_website`、所有表，并写入与设计图一致的初始数据（含默认管理员）。

2. 修改后端数据库连接（如账号密码与默认不同）：

   编辑 `src/main/resources/application.yml`：

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/company_website?...
       username: root      # 改成你的
       password: root      # 改成你的
   ```

---

## 三、运行

在项目根目录（即本 README 所在目录）执行：

```bash
# 方式一：直接运行
mvn spring-boot:run

# 方式二：打包后运行
mvn clean package -DskipTests
java -jar target/company-website.jar
```

启动成功后访问：

| 入口 | 地址 |
| --- | --- |
| 官网前台 | http://localhost:8080/ |
| 后台管理 | http://localhost:8080/admin/login.html |

**默认管理员账号：`admin` / `admin123`**

> 上传的图片保存在运行目录下的 `uploads/` 文件夹，并通过 `/uploads/**` 访问；请保持启动时的工作目录为项目根目录。

---

## 四、功能说明

### 前台官网（还原设计图）
- 顶部导航（滚动渐变）、首页轮播 Banner
- 核心优势（四卡片，可设置高亮卡片）
- 信息系统（图文介绍）
- 成功案例（卡片轮播）
- 您身边的 IT 专家（服务卡片）
- 新闻资讯（首页摘要 + 列表页 + 详情页，含浏览量）
- 页脚（公司信息 / 联系方式 / 备案号）

### 后台管理（若依风格）
- 管理员登录 / 退出 / 修改密码（JWT 鉴权）
- 仪表盘数据统计
- 轮播图管理（图片上传、排序、显隐）
- 核心优势管理
- 成功案例管理（封面上传、发布日期）
- 新闻管理（封面上传、搜索、分页、富文本正文）
- IT 服务管理
- 网站设置（公司名称、各区块文案、信息系统配图、联系方式、备案号等统一维护）

> 所有“文字 / 图片 / 新闻”均可在后台增删改，保存后刷新前台即可看到效果。

---

## 五、目录结构

```
公司官网/
├── pom.xml                      Maven 配置
├── README.md
├── sql/
│   └── company_website.sql      建库建表 + 初始数据
└── src/main/
    ├── java/com/zgt/website/
    │   ├── CompanyWebsiteApplication.java
    │   ├── common/              统一返回 R、JWT、异常处理
    │   ├── config/              Web/MyBatisPlus 配置、数据初始化
    │   ├── interceptor/         JWT 鉴权拦截器
    │   ├── entity/              实体
    │   ├── mapper/              MyBatis-Plus Mapper
    │   ├── service/             业务服务
    │   └── controller/          接口
    └── resources/
        ├── application.yml
        └── static/              前端（由 Spring Boot 托管）
            ├── index.html       官网首页
            ├── news.html        新闻列表
            ├── news-detail.html 新闻详情
            ├── css/  js/  images/
            └── admin/           后台（login / index / pages/*）
```

---

## 六、主要接口

| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| POST | /api/auth/login | 登录 | 否 |
| GET | /api/portal/home | 首页聚合数据 | 否 |
| GET | /api/portal/news | 新闻分页 | 否 |
| GET | /api/portal/news/{id} | 新闻详情 | 否 |
| GET/POST/PUT/DELETE | /api/admin/banner、/advantage、/case、/service | 各模块 CRUD | 是 |
| GET/POST/PUT/DELETE | /api/admin/news | 新闻 CRUD（含 /page 分页） | 是 |
| GET/PUT | /api/admin/config | 网站设置 | 是 |
| POST | /api/admin/upload | 图片上传 | 是 |
| GET | /api/admin/stats | 仪表盘统计 | 是 |

> 后台接口需在请求头携带 `Authorization: Bearer <token>`，前端已自动处理。

---

## 七、说明
- 初始图片为内置 SVG 占位图（蓝色科技风，离线可用），可在后台上传真实图片替换。
- 若 `sql` 脚本未导入管理员，应用启动时会自动兜底创建 `admin/admin123`。
- 生产环境请修改 `application.yml` 中的 `jwt.secret` 与数据库密码。
