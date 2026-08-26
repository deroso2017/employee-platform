
package com.ronitech.employee_platform.publisher;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

import org.springframework.amqp.rabbit.core.RabbitTemplate;

import com.ronitech.employee_platform.config.RabbitMQConfig;
import com.ronitech.employee_platform.event.PasswordResetRequestedEvent;

@ExtendWith(MockitoExtension.class)
class NotificationEventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private NotificationEventPublisher publisher;

    @Test
    void shouldPublishPasswordResetEvent() {

        PasswordResetRequestedEvent event = new PasswordResetRequestedEvent(
                1L,
                "john@test.com",
                "token123");

        publisher.publishPasswordResetRequested(event);

        verify(rabbitTemplate).convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.PASSWORD_RESET_ROUTING_KEY,
                event);
    }
}