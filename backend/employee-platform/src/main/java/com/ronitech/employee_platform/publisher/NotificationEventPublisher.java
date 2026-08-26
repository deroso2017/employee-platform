package com.ronitech.employee_platform.publisher;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import com.ronitech.employee_platform.config.RabbitMQConfig;
import com.ronitech.employee_platform.event.PasswordResetRequestedEvent;
import com.ronitech.employee_platform.event.UserRegisteredEvent;

@Service
public class NotificationEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public NotificationEventPublisher(
            RabbitTemplate rabbitTemplate) {

        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishUserRegistered(
            UserRegisteredEvent event) {

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.USER_REGISTERED_ROUTING_KEY,
                event);
    }

    public void publishPasswordResetRequested(
            PasswordResetRequestedEvent event) {

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.PASSWORD_RESET_ROUTING_KEY,
                event);
    }
}