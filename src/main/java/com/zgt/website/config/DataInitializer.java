package com.zgt.website.config;

import com.zgt.website.entity.SysUser;
import com.zgt.website.mapper.SysUserMapper;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;

/**
 * 提供密码编码器，并在管理员表为空时兜底创建默认账号 admin/admin123。
 */
@Configuration
public class DataInitializer {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public ApplicationRunner initAdmin(SysUserMapper userMapper, BCryptPasswordEncoder encoder) {
        return args -> {
            Long count = userMapper.selectCount(null);
            if (count == null || count == 0) {
                SysUser u = new SysUser();
                u.setUsername("admin");
                u.setPassword(encoder.encode("admin123"));
                u.setNickname("超级管理员");
                u.setStatus(1);
                u.setCreateTime(LocalDateTime.now());
                userMapper.insert(u);
                System.out.println("[初始化] 已创建默认管理员 admin / admin123");
            }
        };
    }
}
