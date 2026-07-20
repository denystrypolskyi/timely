package io.github.denystrypolskyi.bot;

public class BackendException extends Exception {

    private final Integer statusCode;

    public BackendException(String message) {
        super(message);
        this.statusCode = null;
    }

    public BackendException(String message, Integer statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public BackendException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = null;
    }

    public Integer statusCode() {
        return statusCode;
    }
}
