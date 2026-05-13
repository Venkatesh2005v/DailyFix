package com.example.dailyfix.controller;

import com.example.dailyfix.enums.Priority;
import com.example.dailyfix.model.Message;
import com.example.dailyfix.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }


    @PostMapping("/sync")
    public ResponseEntity<String> triggerSync(Authentication authentication) {
        messageService.fetchAndProcessGmail(authentication);
        return ResponseEntity.ok("Starting Intelligence Sync For :" + authentication.getName());
    }

    @GetMapping("/my-messages")
    public ResponseEntity<List<Message>> getMyMessages(Authentication authentication) {
        return ResponseEntity.ok(messageService.getMessagesByUserEmail(authentication.getName()));
    }
    
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Message>> getByPriority(
            Authentication authentication,
            @PathVariable Priority priority) {
        return ResponseEntity.ok(messageService.getMessagesByUserEmailAndPriority(authentication.getName(), priority));
    }

    @PostMapping("/{id}/reprocess")
    public ResponseEntity<String> reprocess(@PathVariable Long id) {
        messageService.reprocessMessage(id);
        return ResponseEntity.ok("Message re-analyzed by AI successfully.");
    }
}