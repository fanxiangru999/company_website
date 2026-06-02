package com.zgt.website.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zgt.website.common.R;
import com.zgt.website.entity.Banner;
import com.zgt.website.mapper.BannerMapper;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/banner")
public class BannerController {

    private final BannerMapper mapper;

    public BannerController(BannerMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping("/list")
    public R<List<Banner>> list() {
        return R.ok(mapper.selectList(new QueryWrapper<Banner>().orderByAsc("sort_order").orderByDesc("id")));
    }

    @GetMapping("/{id}")
    public R<Banner> get(@PathVariable Long id) {
        return R.ok(mapper.selectById(id));
    }

    @PostMapping
    public R<Void> add(@RequestBody Banner banner) {
        banner.setId(null);
        if (banner.getStatus() == null) banner.setStatus(1);
        if (banner.getSortOrder() == null) banner.setSortOrder(0);
        banner.setCreateTime(LocalDateTime.now());
        mapper.insert(banner);
        return R.ok();
    }

    @PutMapping
    public R<Void> update(@RequestBody Banner banner) {
        mapper.updateById(banner);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
