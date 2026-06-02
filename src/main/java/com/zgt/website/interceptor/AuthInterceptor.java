package com.zgt.website.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zgt.website.common.JwtUtil;
import com.zgt.website.common.R;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 后台接口鉴权拦截器，仅拦截 /api/admin/**。
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jwt.header}")
    private String header;

    @Value("${jwt.prefix}")
    private String prefix;

    public AuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String token = request.getHeader(header);
        if (token != null && token.startsWith(prefix)) {
            token = token.substring(prefix.length());
        }
        if (token != null && !token.isEmpty() && jwtUtil.validate(token)) {
            request.setAttribute("userId", jwtUtil.getUserId(token));
            request.setAttribute("username", jwtUtil.getUsername(token));
            return true;
        }
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(R.fail(401, "登录已过期，请重新登录")));
        return false;
    }
}
