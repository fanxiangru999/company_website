package com.zgt.website.controller;

import com.zgt.website.common.BusinessException;
import com.zgt.website.common.R;
import com.zgt.website.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public R<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || username.trim().isEmpty() || password == null || password.isEmpty()) {
            throw new BusinessException("请输入账号和密码");
        }
        return R.ok("登录成功", authService.login(username.trim(), password));
    }

    @PostMapping("/logout")
    public R<Void> logout() {
        return R.ok();
    }
}
