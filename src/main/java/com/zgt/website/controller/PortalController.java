package com.zgt.website.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zgt.website.common.R;
import com.zgt.website.entity.News;
import com.zgt.website.service.PortalService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 前台门户公开接口（无需登录）。
 */
@RestController
@RequestMapping("/api/portal")
public class PortalController {

    private final PortalService portalService;

    public PortalController(PortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/home")
    public R<Map<String, Object>> home() {
        return R.ok(portalService.home());
    }

    @GetMapping("/config")
    public R<Map<String, String>> config() {
        return R.ok(portalService.config());
    }

    @GetMapping("/news")
    public R<IPage<News>> news(@RequestParam(defaultValue = "1") int pageNum,
                               @RequestParam(defaultValue = "6") int pageSize) {
        return R.ok(portalService.newsPage(pageNum, pageSize));
    }

    @GetMapping("/news/{id}")
    public R<News> newsDetail(@PathVariable Long id) {
        return R.ok(portalService.newsDetail(id));
    }
}
