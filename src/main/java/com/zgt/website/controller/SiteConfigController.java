package com.zgt.website.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zgt.website.common.R;
import com.zgt.website.entity.SiteConfig;
import com.zgt.website.mapper.SiteConfigMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 网站设置：键值对统一管理。
 */
@RestController
@RequestMapping("/api/admin/config")
public class SiteConfigController {

    private final SiteConfigMapper mapper;

    public SiteConfigController(SiteConfigMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping("/list")
    public R<List<SiteConfig>> list() {
        return R.ok(mapper.selectList(new QueryWrapper<SiteConfig>().orderByAsc("sort_order").orderByAsc("id")));
    }

    /** 批量更新配置项的值 */
    @PutMapping
    public R<Void> update(@RequestBody List<SiteConfig> configs) {
        if (configs != null) {
            for (SiteConfig c : configs) {
                if (c.getId() == null) continue;
                SiteConfig upd = new SiteConfig();
                upd.setId(c.getId());
                upd.setConfigValue(c.getConfigValue() == null ? "" : c.getConfigValue());
                mapper.updateById(upd);
            }
        }
        return R.ok();
    }
}
