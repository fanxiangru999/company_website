package com.zgt.website.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zgt.website.common.R;
import com.zgt.website.entity.CaseItem;
import com.zgt.website.entity.News;
import com.zgt.website.mapper.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

/**
 * 后台仪表盘统计：模块计数、发布趋势、新闻浏览量排行。
 */
@RestController
@RequestMapping("/api/admin/stats")
public class DashboardController {

    private static final DateTimeFormatter YM = DateTimeFormatter.ofPattern("yyyy-MM");

    private final BannerMapper bannerMapper;
    private final CaseItemMapper caseItemMapper;
    private final NewsMapper newsMapper;
    private final ServiceItemMapper serviceItemMapper;
    private final AdvantageMapper advantageMapper;

    public DashboardController(BannerMapper bannerMapper, CaseItemMapper caseItemMapper,
                              NewsMapper newsMapper, ServiceItemMapper serviceItemMapper,
                              AdvantageMapper advantageMapper) {
        this.bannerMapper = bannerMapper;
        this.caseItemMapper = caseItemMapper;
        this.newsMapper = newsMapper;
        this.serviceItemMapper = serviceItemMapper;
        this.advantageMapper = advantageMapper;
    }

    @GetMapping
    public R<Map<String, Object>> stats() {
        Map<String, Object> m = new LinkedHashMap<>();
        // 各模块内容数量（卡片 + 柱状图）
        m.put("bannerCount", bannerMapper.selectCount(null));
        m.put("advantageCount", advantageMapper.selectCount(null));
        m.put("caseCount", caseItemMapper.selectCount(null));
        m.put("newsCount", newsMapper.selectCount(null));
        m.put("serviceCount", serviceItemMapper.selectCount(null));
        // 折线图：近 6 个月新闻 / 案例发布趋势
        m.put("trend", buildTrend());
        // 饼图：新闻浏览量排行（前端取 Top5 + 其他）
        m.put("newsViews", buildNewsViews());
        return R.ok(m);
    }

    /**
     * 按 publish_date 的 yyyy-MM 聚合新闻、案例发布数量。
     * 仅保留实际有数据的月份，按时间升序取最近 6 个（种子数据时间较早，按今天往前推会全为 0）。
     */
    private Map<String, Object> buildTrend() {
        Map<String, Integer> newsByMonth = new HashMap<>();
        Map<String, Integer> caseByMonth = new HashMap<>();

        for (News n : newsMapper.selectList(null)) {
            LocalDate d = n.getPublishDate();
            if (d != null) {
                newsByMonth.merge(d.format(YM), 1, Integer::sum);
            }
        }
        for (CaseItem c : caseItemMapper.selectList(null)) {
            LocalDate d = c.getPublishDate();
            if (d != null) {
                caseByMonth.merge(d.format(YM), 1, Integer::sum);
            }
        }

        TreeSet<String> monthSet = new TreeSet<>();
        monthSet.addAll(newsByMonth.keySet());
        monthSet.addAll(caseByMonth.keySet());

        List<String> ordered = new ArrayList<>(monthSet);
        if (ordered.size() > 6) {
            ordered = ordered.subList(ordered.size() - 6, ordered.size());
        }

        List<String> months = new ArrayList<>();
        List<Integer> newsArr = new ArrayList<>();
        List<Integer> caseArr = new ArrayList<>();
        for (String month : ordered) {
            months.add(month);
            newsArr.add(newsByMonth.getOrDefault(month, 0));
            caseArr.add(caseByMonth.getOrDefault(month, 0));
        }

        Map<String, Object> trend = new LinkedHashMap<>();
        trend.put("months", months);
        trend.put("news", newsArr);
        trend.put("cases", caseArr);
        return trend;
    }

    /** 新闻浏览量排行：title + views，按 views 降序 */
    private List<Map<String, Object>> buildNewsViews() {
        List<News> list = newsMapper.selectList(new QueryWrapper<News>().orderByDesc("views"));
        List<Map<String, Object>> result = new ArrayList<>();
        for (News n : list) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("title", n.getTitle());
            item.put("views", n.getViews() == null ? 0 : n.getViews());
            result.add(item);
        }
        return result;
    }
}
