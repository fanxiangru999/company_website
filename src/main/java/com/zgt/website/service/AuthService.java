package com.zgt.website.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zgt.website.common.BusinessException;
import com.zgt.website.common.JwtUtil;
import com.zgt.website.entity.SysUser;
import com.zgt.website.mapper.SysUserMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final SysUserMapper userMapper;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(SysUserMapper userMapper, BCryptPasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userMapper = userMapper;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> login(String username, String password) {
        SysUser user = userMapper.selectOne(new QueryWrapper<SysUser>().eq("username", username));
        if (user == null || !encoder.matches(password, user.getPassword())) {
            throw new BusinessException("账号或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new BusinessException("账号已被停用");
        }
        String token = jwtUtil.createToken(user.getId(), user.getUsername());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("user", user);
        return result;
    }
}
