package com.heatsafe.adapter.fortyguard.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class FortyGuardException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    public FortyGuardException(String message) {
        super(message);
        this.status = HttpStatus.BAD_GATEWAY;
        this.errorCode = "FORTYGUARD_API_ERROR";
    }

    public FortyGuardException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public FortyGuardException(String message, Throwable cause, HttpStatus status, String errorCode) {
        super(message, cause);
        this.status = status;
        this.errorCode = errorCode;
    }
}
