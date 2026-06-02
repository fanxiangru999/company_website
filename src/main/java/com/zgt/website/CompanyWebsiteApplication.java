package com.zgt.website;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.zgt.website.mapper")
public class CompanyWebsiteApplication {

    public static void main(String[] args) {
        SpringApplication.run(CompanyWebsiteApplication.class, args);
        System.out.println("\n  中赣通官网启动成功 → 前台 http://localhost:8080/  后台 http://localhost:8080/admin/login.html\n");
    }
}
