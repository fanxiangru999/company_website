package com.zgt.website.controller;

import com.zgt.website.common.BusinessException;
import com.zgt.website.common.R;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 图片/文件上传，保存到本地上传目录，返回可访问地址。
 */
@RestController
@RequestMapping("/api/admin/upload")
public class UploadController {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.access-prefix}")
    private String accessPrefix;

    @PostMapping
    public R<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择要上传的文件");
        }
        String original = file.getOriginalFilename();
        String ext = "";
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;
        File dir = new File(uploadDir);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new BusinessException("创建上传目录失败");
        }
        file.transferTo(new File(dir, filename).getAbsoluteFile());

        Map<String, String> data = new HashMap<>();
        data.put("url", accessPrefix + filename);
        return R.ok("上传成功", data);
    }
}
