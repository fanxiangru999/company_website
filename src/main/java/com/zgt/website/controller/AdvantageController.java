package com.zgt.website.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zgt.website.common.R;
import com.zgt.website.entity.Advantage;
import com.zgt.website.mapper.AdvantageMapper;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/advantage")
public class AdvantageController {

    private final AdvantageMapper mapper;

    public AdvantageController(AdvantageMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping("/list")
    public R<List<Advantage>> list() {
        return R.ok(mapper.selectList(new QueryWrapper<Advantage>().orderByAsc("sort_order").orderByDesc("id")));
    }

    @GetMapping("/{id}")
    public R<Advantage> get(@PathVariable Long id) {
        return R.ok(mapper.selectById(id));
    }

    @PostMapping
    public R<Void> add(@RequestBody Advantage advantage) {
        advantage.setId(null);
        if (advantage.getStatus() == null) advantage.setStatus(1);
        if (advantage.getSortOrder() == null) advantage.setSortOrder(0);
        if (advantage.getFeatured() == null) advantage.setFeatured(0);
        advantage.setCreateTime(LocalDateTime.now());
        mapper.insert(advantage);
        return R.ok();
    }

    @PutMapping
    public R<Void> update(@RequestBody Advantage advantage) {
        mapper.updateById(advantage);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
