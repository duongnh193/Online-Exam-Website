package vn.com.example.exam.online.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.com.example.exam.online.repository.ClassRepository;

@Service
@RequiredArgsConstructor
public class ClassService {
    private final ClassRepository classRepository;


}
