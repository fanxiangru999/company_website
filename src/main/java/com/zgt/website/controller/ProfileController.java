package com.zgt.website.controller;

import com.zgt.website.common.BusinessException;
import com.zgt.website.common.R;
import com.zgt.website.entity.SysUser;
import com.zgt.website.mapper.SysUserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 当前登录管理员信息与修改密码。
 */
@RestController
@RequestMapping("/api/admin/profile")
public class ProfileController {

    private final SysUserMapper userMapper;
    private final BCryptPasswordEncoder encoder;

    public ProfileController(SysUserMapper userMapper, BCryptPasswordEncoder encoder) {
        this.userMapper = userMapper;
        this.encoder = encoder;
    }

    @GetMapping
    public R<SysUser> profile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return R.ok(userMapper.selectById(userId));
    }

    @PutMapping("/password")
    public R<Void> changePassword(HttpServletRequest request, @RequestBody Map<String, String> body) {
        Long userId = (Long) request.getAttribute("userId");
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.length() < 5) {
            throw new BusinessException("新密码长度不能少于 5 位");
        }
        if (!encoder.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("原密码不正确");
        }
        SysUser upd = new SysUser();
        upd.setId(userId);
        upd.setPassword(encoder.encode(newPassword));
        userMapper.updateById(upd);
        return R.ok();
    }
}
