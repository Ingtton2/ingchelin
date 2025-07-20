package com.restaurant.backend.controller;

import com.restaurant.backend.entity.User;
import com.restaurant.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String username = request.get("username");
        
        // 이메일 중복 확인
        if (userRepository.existsByEmail(email)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "이미 존재하는 이메일입니다.");
            return ResponseEntity.badRequest().body(error);
        }
        
        // 새 사용자 생성
        User user = new User(email, password, username);
        User savedUser = userRepository.save(user);
        
        // 비밀번호 제외하고 응답
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("email", savedUser.getEmail());
        response.put("username", savedUser.getUsername());
        response.put("createdAt", savedUser.getCreatedAt());
        
        return ResponseEntity.ok(response);
    }
    
    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user != null && user.getPassword().equals(password)) {
            // 비밀번호 제외하고 응답
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("username", user.getUsername());
            response.put("createdAt", user.getCreatedAt());
            
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "이메일 또는 비밀번호가 잘못되었습니다.");
            return ResponseEntity.badRequest().body(error);
        }
    }
} 