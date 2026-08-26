package com.ronitech.employee_platform.consumer;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.contains;
import static org.mockito.Mockito.eq;

import com.ronitech.employee_platform.event.PasswordResetRequestedEvent;
import com.ronitech.employee_platform.service.EmailService;

@ExtendWith(MockitoExtension.class)
class NotificationEventConsumerTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationEventConsumer consumer;

    @Test
    void shouldSendPasswordResetEmail() {

        PasswordResetRequestedEvent event = new PasswordResetRequestedEvent(
                1L,
                "john@test.com",
                "token123");

        consumer.handlePasswordResetRequested(event);

        verify(emailService).sendEmail(
                eq("john@test.com"),
                eq("Reset your Employee Platform password"),
                contains("token123"));
    }
}
