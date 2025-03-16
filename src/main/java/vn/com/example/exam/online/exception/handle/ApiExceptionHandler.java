package vn.com.example.exam.online.exception.handle;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import vn.com.example.exam.online.exception.InvalidPasswordException;
import vn.com.example.exam.online.exception.UserExistException;
import vn.com.example.exam.online.exception.UserNotFoundException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(Exception.class)
    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorMessage handleAllException(Exception ex) {
        return new ErrorMessage(10000, ex.getLocalizedMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorMessage handleValidationExceptions(MethodArgumentNotValidException ex) {
        return new ErrorMessage(10010, ex.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(value = HttpStatus.NOT_FOUND)
    public ErrorMessage handleUserNotFoundException(UserNotFoundException ex) {
        return new ErrorMessage(10100, ex.getMessage());
    }

    @ExceptionHandler(UserExistException.class)
    @ResponseStatus(value = HttpStatus.CONFLICT)
    public ErrorMessage handleUserExistException(UserExistException ex) {
        return new ErrorMessage(10101, ex.getMessage());
    }

    @ExceptionHandler(InvalidPasswordException.class)
    @ResponseStatus(value = HttpStatus.CONFLICT)
    public ErrorMessage handleInvalidPasswordException(InvalidPasswordException ex) {
        return new ErrorMessage(10102, ex.getMessage());
    }
}
