package com.zgt.website.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zgt.website.common.BusinessException;
import com.zgt.website.entity.*;
import com.zgt.website.mapper.*;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 前台门户数据聚合服务。
 */
@Service
public class PortalService {

    private final BannerMapper bannerMapper;
    private final AdvantageMapper advantageMapper;
    private final CaseItemMapper caseItemMapper;
    private final ServiceItemMapper serviceItemMapper;
    private final NewsMapper newsMapper;
    private final SiteConfigMapper siteConfigMapper;

    public PortalService(BannerMapper bannerMapper, AdvantageMapper advantageMapper,
                         CaseItemMapper caseItemMapper, ServiceItemMapper serviceItemMapper,
                         NewsMapper newsMapper, SiteConfigMapper siteConfigMapper) {
        this.bannerMapper = bannerMapper;
        this.advantageMapper = advantageMapper;
        this.caseItemMapper = caseItemMapper;
        this.serviceItemMapper = serviceItemMapper;
        this.newsMapper = newsMapper;
        this.siteConfigMapper = siteConfigMapper;
    }

    /** 首页所需的全部数据，一次性返回 */
    public Map<String, Object> home() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("banners", bannerMapper.selectList(
                new QueryWrapper<Banner>().eq("status", 1).orderByAsc("sort_order").orderByAsc("id")));
        result.put("advantages", advantageMapper.selectList(
                new QueryWrapper<Advantage>().eq("status", 1).orderByAsc("sort_order").orderByAsc("id")));
        result.put("cases", caseItemMapper.selectList(
                new QueryWrapper<CaseItem>().eq("status", 1).orderByAsc("sort_order").orderByAsc("id")));
        result.put("services", serviceItemMapper.selectList(
                new QueryWrapper<ServiceItem>().eq("status", 1).orderByAsc("sort_order").orderByAsc("id")));
        result.put("news", newsMapper.selectList(
                new QueryWrapper<News>().eq("status", 1).orderByDesc("publish_date").orderByDesc("id").last("limit 3")));

        result.put("config", config());
        return result;
    }

    /** 网站设置键值对（前台公开接口，后台登录页等也可读取网站名） */
    public Map<String, String> config() {
        List<SiteConfig> configs = siteConfigMapper.selectList(null);
        Map<String, String> cfg = new LinkedHashMap<>();
        for (SiteConfig c : configs) {
            cfg.put(c.getConfigKey(), c.getConfigValue());
        }
        return cfg;
    }

    public IPage<News> newsPage(int pageNum, int pageSize) {
        Page<News> page = new Page<>(pageNum, pageSize);
        return newsMapper.selectPage(page,
                new QueryWrapper<News>().eq("status", 1).orderByDesc("publish_date").orderByDesc("id"));
    }

    public News newsDetail(Long id) {
        News news = newsMapper.selectById(id);
        if (news == null || (news.getStatus() != null && news.getStatus() == 0)) {
            throw new BusinessException("新闻不存在或已下线");
        }
        int views = news.getViews() == null ? 0 : news.getViews();
        News upd = new News();
        upd.setId(id);
        upd.setViews(views + 1);
        newsMapper.updateById(upd);
        news.setViews(views + 1);
        return news;
    }
}
