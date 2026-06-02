package com.zgt.website.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zgt.website.common.R;
import com.zgt.website.entity.News;
import com.zgt.website.mapper.NewsMapper;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/news")
public class NewsController {

    private final NewsMapper mapper;

    public NewsController(NewsMapper mapper) {
        this.mapper = mapper;
    }

    @GetMapping("/page")
    public R<IPage<News>> page(@RequestParam(defaultValue = "1") int pageNum,
                               @RequestParam(defaultValue = "10") int pageSize,
                               @RequestParam(required = false) String title) {
        Page<News> page = new Page<>(pageNum, pageSize);
        QueryWrapper<News> qw = new QueryWrapper<>();
        if (title != null && !title.trim().isEmpty()) {
            qw.like("title", title.trim());
        }
        qw.orderByDesc("create_time").orderByDesc("id");
        return R.ok(mapper.selectPage(page, qw));
    }

    @GetMapping("/{id}")
    public R<News> get(@PathVariable Long id) {
        return R.ok(mapper.selectById(id));
    }

    @PostMapping
    public R<Void> add(@RequestBody News news) {
        news.setId(null);
        if (news.getStatus() == null) news.setStatus(1);
        if (news.getViews() == null) news.setViews(0);
        if (news.getPublishDate() == null) news.setPublishDate(LocalDate.now());
        news.setCreateTime(LocalDateTime.now());
        mapper.insert(news);
        return R.ok();
    }

    @PutMapping
    public R<Void> update(@RequestBody News news) {
        mapper.updateById(news);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        mapper.deleteById(id);
        return R.ok();
    }
}
