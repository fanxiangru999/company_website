package com.zgt.website.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zgt.website.common.R;
import com.zgt.website.entity.ServiceItem;
import com.zgt.website.mapper.ServiceItemMapper;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/service")
public class ServiceController {

    private final ServiceItemMapper mapper;

    public ServiceController(ServiceItemMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping("/list")
    public R<List<ServiceItem>> list() {
        return R.ok(mapper.selectList(new QueryWrapper<ServiceItem>().orderByAsc("sort_order").orderByDesc("id")));
    }

    @GetMapping("/{id}")
    public R<ServiceItem> get(@PathVariable Long id) {
        return R.ok(mapper.selectById(id));
    }

    @PostMapping
    public R<Void> add(@RequestBody ServiceItem item) {
        item.setId(null);
        if (item.getStatus() == null) item.setStatus(1);
        if (item.getSortOrder() == null) item.setSortOrder(0);
        item.setCreateTime(LocalDateTime.now());
        mapper.insert(item);
        return R.ok();
    }

    @PutMapping
    public R<Void> update(@RequestBody ServiceItem item) {
        mapper.updateById(item);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
