package com.example.dailyfix.controller;

import com.example.dailyfix.model.Task;
import com.example.dailyfix.service.AIService;
import com.example.dailyfix.service.MessageService;
import com.example.dailyfix.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", allowCredentials = "true")
public class TaskController {

    private final TaskService taskService;
    private final AIService aiService;
    private final MessageService messageService;

    public TaskController(TaskService taskService, AIService aiService, MessageService messageService) {
        this.taskService = taskService;
        this.aiService = aiService;
        this.messageService = messageService;
    }

    
    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }


    @GetMapping("/my-tasks")
    public List<Task> getMyTasks(
            @RequestParam(required = false) Long messageId,
            Authentication authentication
    ) {
        String email = getEmailFromAuth(authentication);


        if (messageId != null) {
            return taskService.getTasksByMessageIdAndEmail(messageId, email);
        }

        return taskService.getTasksByAssignedUserEmail(email);
    }


    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeTask(@PathVariable Long id, Authentication authentication) {
        String email = getEmailFromAuth(authentication);
        try {
            taskService.completeTaskByEmail(id, email);
            return ResponseEntity.ok("Task completed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


    @PostMapping("/{id}/dismiss")
    public ResponseEntity<?> dismissTask(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {
        String email = getEmailFromAuth(authentication);
        String reason = payload.getOrDefault("reason", "No reason provided");

        try {
            taskService.dismissTask(id, email, reason);
            return ResponseEntity.ok("Task dismissed. Feedback recorded.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }


    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        taskService.updateTaskStatus(id, newStatus);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/{id}/generate-reply")
    public ResponseEntity<?> generateReply(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);


        String context = "Task: " + task.getTitle() + " | Content: " + task.getDescription();
        String aiDraft = aiService.generateDraft(context);

        return ResponseEntity.ok(Map.of("reply", aiDraft));
    }

    @PostMapping("/{id}/send-reply")
    public ResponseEntity<?> sendReply(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String replyText = payload.get("replyText");
        Task task = taskService.getTaskById(id);
        String recipient = task.getSourceMessage().getSenderEmail();
        String subject = "DailyFix Update: " + task.getTitle();


        messageService.sendNewEmail(recipient, subject, replyText);

        return ResponseEntity.ok(Map.of("status", "TRANSMITTED"));
    }

    private String getEmailFromAuth(Authentication authentication) {
        if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
            return oauthToken.getPrincipal().getAttribute("email");
        }
        return authentication.getName();
    }


}