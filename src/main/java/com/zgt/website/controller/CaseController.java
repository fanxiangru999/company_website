package com.zgt.website.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zgt.website.common.R;
import com.zgt.website.entity.CaseItem;
import com.zgt.website.mapper.CaseItemMapper;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/case")
public class CaseController {

    private final CaseItemMapper mapper;

    public CaseController(CaseItemMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping("/list")
    public R<List<CaseItem>> list() {
        return R.ok(mapper.selectList(new QueryWrapper<CaseItem>().orderByAsc("sort_order").orderByDesc("id")));
    }

    @GetMapping("/{id}")
    public R<CaseItem> get(@PathVariable Long id) {
        return R.ok(mapper.selectById(id));
    }

    @PostMapping
    public R<Void> add(@RequestBody CaseItem item) {
        item.setId(null);
        if (item.getStatus() == null) item.setStatus(1);
        if (item.getSortOrder() == null) item.setSortOrder(0);
        if (item.getPublishDate() == null) item.setPublishDate(LocalDate.now());
        item.setCreateTime(LocalDateTime.now());
        mapper.insert(item);
        return R.ok();
    }

    @PutMapping
    public R<Void> update(@RequestBody CaseItem item) {
        mapper.updateById(item);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
