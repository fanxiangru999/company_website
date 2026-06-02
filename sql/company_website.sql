-- =============================================================
--  中赣通 公司官网 + 后台管理系统  数据库脚本
--  数据库：MySQL 5.7+ / 8.0
--  字符集：utf8mb4
--  使用：在 MySQL 中执行本脚本即可建库、建表并写入初始数据
-- =============================================================

CREATE DATABASE IF NOT EXISTS `company_website`
    DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `company_website`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- 1. 后台管理员表
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `username`    VARCHAR(50)  NOT NULL COMMENT '登录账号',
    `password`    VARCHAR(100) NOT NULL COMMENT '密码(BCrypt)',
    `nickname`    VARCHAR(50)  DEFAULT NULL COMMENT '昵称',
    `avatar`      VARCHAR(255) DEFAULT NULL COMMENT '头像',
    `status`      TINYINT      DEFAULT 1 COMMENT '状态 1正常 0停用',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '后台管理员';

-- 默认管理员：admin / admin123  （password 为 admin123 的 BCrypt 哈希，$2a$10$，Spring BCrypt 兼容）
INSERT INTO `sys_user` (`username`, `password`, `nickname`, `status`)
VALUES ('admin', '$2a$10$HbC29NHM8pp9DA6OHPVw/OgrBb2P856SgFslTijCdk4yq6N8oY4u6', '超级管理员', 1);

-- -------------------------------------------------------------
-- 2. 首页轮播图（Banner）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `banner`;
CREATE TABLE `banner` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title`       VARCHAR(100) DEFAULT NULL COMMENT '主标题',
    `subtitle`    VARCHAR(255) DEFAULT NULL COMMENT '副标题',
    `image_url`   VARCHAR(255) DEFAULT NULL COMMENT '背景图地址',
    `sort_order`  INT          DEFAULT 0 COMMENT '排序(小在前)',
    `status`      TINYINT      DEFAULT 1 COMMENT '状态 1显示 0隐藏',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '首页轮播图';

INSERT INTO `banner` (`title`, `subtitle`, `image_url`, `sort_order`, `status`) VALUES
('系统开发团队', '对客户要求进行持续响应，保证系统满足用户业户动态发展的需要', '/images/hero1.svg', 1, 1),
('信息化解决方案', '以专业的技术与服务，助力企业数字化转型升级', '/images/hero2.svg', 2, 1),
('您身边的 IT 专家', '7x24 小时提供出色的 IT 服务，让科技触手可及', '/images/hero3.svg', 3, 1);

-- -------------------------------------------------------------
-- 3. 核心优势（Advantage）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `advantage`;
CREATE TABLE `advantage` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title`       VARCHAR(50)  DEFAULT NULL COMMENT '标题',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `icon`        VARCHAR(50)  DEFAULT NULL COMMENT '图标标识 scale/team/rd/standard',
    `featured`    TINYINT      DEFAULT 0 COMMENT '是否高亮卡片 1是 0否',
    `sort_order`  INT          DEFAULT 0 COMMENT '排序',
    `status`      TINYINT      DEFAULT 1 COMMENT '状态 1显示 0隐藏',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '核心优势';

INSERT INTO `advantage` (`title`, `description`, `icon`, `featured`, `sort_order`, `status`) VALUES
('规模经营', '规模化的运营不仅提供更多优质的选择，还保障确保服务质量，降低运营成本。', 'scale', 0, 1, 1),
('专业化团队', '规模化的运营不仅提供更多优质的选择，还保障确保服务质量，降低运营成本。', 'team', 1, 2, 1),
('技术研发', '一直围绕技术创新成为企业的活力源泉，建立了一整套现代化服务系统。', 'rd', 0, 3, 1),
('体系规范', '各项服务指标均已接近国际领先水平，服务质量和客户满意度也随之大幅提升。', 'standard', 0, 4, 1);

-- -------------------------------------------------------------
-- 4. 成功案例（CaseItem）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `case_item`;
CREATE TABLE `case_item` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title`        VARCHAR(100) DEFAULT NULL COMMENT '案例标题',
    `summary`      VARCHAR(500) DEFAULT NULL COMMENT '简介',
    `content`      TEXT         DEFAULT NULL COMMENT '详情(HTML)',
    `image_url`    VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    `publish_date` DATE         DEFAULT NULL COMMENT '发布日期',
    `sort_order`   INT          DEFAULT 0 COMMENT '排序',
    `status`       TINYINT      DEFAULT 1 COMMENT '状态 1显示 0隐藏',
    `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '成功案例';

INSERT INTO `case_item` (`title`, `summary`, `content`, `image_url`, `publish_date`, `sort_order`, `status`) VALUES
('案例一', '这是案例一一者是案例一一者是案例一一这是案例一一者是案例一一者是案例一。', '<p>这是案例一的详细介绍内容。</p>', '/images/case1.svg', '2021-06-11', 1, 1),
('案例二', '这是案例二一者是案例二一者是案例二一这是案例二一者是案例二一者是案例二。', '<p>这是案例二的详细介绍内容。</p>', '/images/case2.svg', '2021-06-11', 2, 1),
('案例三', '这是案例三一者是案例三一者是案例三一这是案例三一者是案例三一者是案例三。', '<p>这是案例三的详细介绍内容。</p>', '/images/case3.svg', '2021-06-11', 3, 1);

-- -------------------------------------------------------------
-- 5. 新闻资讯（News）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title`        VARCHAR(200) DEFAULT NULL COMMENT '标题',
    `summary`      VARCHAR(500) DEFAULT NULL COMMENT '摘要',
    `content`      LONGTEXT     DEFAULT NULL COMMENT '正文(HTML)',
    `cover_image`  VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    `author`       VARCHAR(50)  DEFAULT NULL COMMENT '作者',
    `views`        INT          DEFAULT 0 COMMENT '浏览量',
    `publish_date` DATE         DEFAULT NULL COMMENT '发布日期',
    `status`       TINYINT      DEFAULT 1 COMMENT '状态 1发布 0草稿',
    `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '新闻资讯';

INSERT INTO `news` (`title`, `summary`, `content`, `cover_image`, `author`, `views`, `publish_date`, `status`) VALUES
('中赣通信息科技完成新一轮系统升级', '为给客户提供更稳定高效的服务，我司核心系统于近日完成全面升级。', '<p>为给客户提供更稳定高效的服务，我司核心系统于近日完成全面升级，整体性能与稳定性大幅提升。</p><p>本次升级覆盖智能化办公、数据填报、批处理等多个模块，进一步提升了系统的可用性与用户体验。</p>', '/images/news1.svg', '管理员', 128, '2024-03-18', 1),
('公司荣获"年度优秀信息化服务商"称号', '凭借专业的技术实力与优质的服务口碑，公司荣获行业重要奖项。', '<p>凭借专业的技术实力与优质的服务口碑，我司在年度行业评选中荣获"年度优秀信息化服务商"称号。</p><p>这是行业对我们多年深耕信息化服务的高度认可，未来我们将继续以客户为中心，提供更优质的产品与服务。</p>', '/images/news2.svg', '管理员', 96, '2024-02-09', 1),
('数字化转型沙龙活动圆满举办', '聚焦企业数字化转型痛点，与众多行业伙伴共话未来。', '<p>近日，由我司主办的数字化转型主题沙龙圆满举办，活动聚焦企业数字化转型中的痛点与解决方案。</p><p>来自各行业的伙伴齐聚一堂，共同探讨信息化建设的趋势与实践经验。</p>', '/images/news3.svg', '管理员', 75, '2024-01-22', 1);

-- -------------------------------------------------------------
-- 6. IT 服务卡片（您身边的 IT 专家）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `service_item`;
CREATE TABLE `service_item` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title`       VARCHAR(50)  DEFAULT NULL COMMENT '标题',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `image_url`   VARCHAR(255) DEFAULT NULL COMMENT '配图',
    `sort_order`  INT          DEFAULT 0 COMMENT '排序',
    `status`      TINYINT      DEFAULT 1 COMMENT '状态 1显示 0隐藏',
    `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'IT服务卡片';

INSERT INTO `service_item` (`title`, `description`, `image_url`, `sort_order`, `status`) VALUES
('智能化办公', '这是案例案例一一者是案例案例一一这是案例案例。', '/images/service1.svg', 1, 1),
('提升效率', '这是案例案例一一者是案例案例一一这是案例案例。', '/images/service2.svg', 2, 1),
('流程人性化', '这是案例案例一一者是案例案例一一这是案例案例。', '/images/service3.svg', 3, 1);

-- -------------------------------------------------------------
-- 7. 网站设置（键值对，供后台“网站设置”统一管理文案/联系方式）
-- -------------------------------------------------------------
DROP TABLE IF EXISTS `site_config`;
CREATE TABLE `site_config` (
    `id`           BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `config_key`   VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT         DEFAULT NULL COMMENT '配置值',
    `remark`       VARCHAR(255) DEFAULT NULL COMMENT '中文说明(作为表单标签)',
    `config_group` VARCHAR(50)  DEFAULT NULL COMMENT '分组',
    `sort_order`   INT          DEFAULT 0 COMMENT '排序',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '网站设置';

INSERT INTO `site_config` (`config_key`, `config_value`, `remark`, `config_group`, `sort_order`) VALUES
('site_name',                '中赣通',                          '网站名称/Logo文字', '基本信息', 1),
('company_full_name',        '贵州中赣通信息科技有限公司',        '公司全称(页脚)',    '基本信息', 2),
('advantage_section_title',  '核心优势',                        '核心优势-标题',     '首页文案', 10),
('advantage_section_subtitle','服务规模化和资源规模化是贯彻旅行网的核心优势之一。流程囊括世界上最大的旅游业服务网联中心。', '核心优势-副标题', '首页文案', 11),
('info_title',               '信息系统',                        '信息系统-标题',     '首页文案', 12),
('info_content',             '智能化办公，提升效率；流程人性化。\n监管数据可模块化填报；只能一键式全市场下单交易，后台自动跑批数据。\n我们的流线式网页布局设计方案和可视化图文内容编辑模式让网站制作和维护成为一件轻松惬意的事。\n无论您是普通互联网用户，还是专业网站制作人员。', '信息系统-正文(每行一段)', '首页文案', 13),
('info_button_text',         '联系我们',                        '信息系统-按钮文字', '首页文案', 14),
('info_image',               '/images/info.svg',                '信息系统-配图',     '首页文案', 15),
('case_section_title',       '成功案例',                        '成功案例-标题',     '首页文案', 16),
('expert_caption',           '7x24小时提供出色的 IT 服务',       'IT专家-小标题',     '首页文案', 17),
('expert_title',             '您身边的 IT 专家',                'IT专家-大标题',     '首页文案', 18),
('expert_content',           '智能化办公，提升效率；流程人性化。\n监管数据可模块化填报；只能一键式全市场下单交易，后台自动跑批数据。', 'IT专家-正文(每行一段)', '首页文案', 19),
('expert_button_text',       '联系我们',                        'IT专家-按钮文字',   '首页文案', 20),
('news_section_title',       '新闻资讯',                        '新闻资讯-标题',     '首页文案', 21),
('footer_phone',             'xxxxxxxxxxxx',                    '电话',             '联系方式', 30),
('footer_fax',               'xxxxxxxxxxxx',                    '传真',             '联系方式', 31),
('footer_wechat',            'xxxxxxxxxxxx',                    '微信',             '联系方式', 32),
('footer_email',             'xxxxxxxxxxxx',                    '邮箱',             '联系方式', 33),
('footer_address',           '贵州省贵阳市南明区宝山南路27号',     '地址',             '联系方式', 34),
('icp',                      '黔ICP备xxxxxxxx号',               'ICP备案号',        '联系方式', 35);

SET FOREIGN_KEY_CHECKS = 1;
