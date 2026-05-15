package com.example.dailyfix.service;

import org.springframework.stereotype.Service;

@Service
public class AIService {

    private final AiFallbackService aiFallbackService;

    public AIService(AiFallbackService aiFallbackService) {
        this.aiFallbackService = aiFallbackService;
    }

    public String summarizeEmails(String rawContent) {

        String prompt =
                "Review these separate email threads from the last 72 hours. " +
                        "Provide a ONE-LINE situational report (max 20 words) " +
                        "that identifies key participants or topics. " +
                        "Example: 'Updates from HR regarding payroll and a request " +
                        "from Team Alpha on the API.' " +
                        "Data: " + rawContent;

        return aiFallbackService.analyze(prompt);
    }

    public String summarizeTasks(String taskContent) {

        String prompt =
                "Review these active tasks. Provide a ONE-LINE executive summary " +
                        "(max 15 words) describing the user's current primary work focus. " +
                        "Tasks: " + taskContent;

        return aiFallbackService.analyze(prompt);
    }

    public String generateDraft(String context) {

        String prompt =
                "Review the following task/email context and write a professional " +
                        "reply message (max 3 sentences). " +
                        "Do not use placeholders like [Name]. " +
                        "Context: " + context;

        return aiFallbackService.analyze(prompt);
    }
}