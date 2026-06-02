package com.zgt.website.common;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * 全局异常处理，保证所有接口都返回统一的 R 结构。
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public R<Void> handleBusiness(BusinessException e) {
        return R.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public R<Void> handleUploadSize(MaxUploadSizeExceededException e) {
        return R.fail("上传文件过大，请控制在 10MB 以内");
    }

    @ExceptionHandler(Exception.class)
    public R<Void> handleException(Exception e) {
        e.printStackTrace();
        return R.fail("服务器异常：" + e.getMessage());
    }
}
