package com.ronitech.employee_platform.consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import com.ronitech.employee_platform.config.RabbitMQConfig;
import com.ronitech.employee_platform.event.PasswordResetRequestedEvent;
import com.ronitech.employee_platform.event.UserRegisteredEvent;
import com.ronitech.employee_platform.service.EmailService;

@Service
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);
    private final EmailService emailService;

    public NotificationEventConsumer(
            EmailService emailService) {

        this.emailService = emailService;
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleUserRegistered(
            UserRegisteredEvent event) {

        try {
            emailService.sendEmail(
                    event.email(),
                    "Welcome to Employee Platform",
                    "Hello " + event.email()
                            + ",\n\n"
                            + "Welcome to Employee Platform!");
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", event.email(), e.getMessage());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handlePasswordResetRequested(
            PasswordResetRequestedEvent event) {

        String resetLink = "http://localhost:3000/reset-password?token="
                + event.resetToken();

        try {
            emailService.sendEmail(
                    event.email(),
                    "Reset your Employee Platform password",
                    "Hello,\n\n"
                            + "You requested a password reset.\n\n"
                            + "Reset your password here:\n"
                            + resetLink
                            + "\n\n"
                            + "If you did not request this, "
                            + "you can ignore this email.");
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", event.email(), e.getMessage());
        }
    }
}