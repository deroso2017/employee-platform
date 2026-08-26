package com.ronitech.employee_platform.publisher;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.ronitech.employee_platform.config.RabbitMQConfig;
import com.ronitech.employee_platform.event.EmployeeCreatedEvent;

@Component
public class EmployeeEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public EmployeeEventPublisher(
            RabbitTemplate rabbitTemplate) {

        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishEmployeeCreated(
            EmployeeCreatedEvent event) {

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMPLOYEE_EXCHANGE,
                RabbitMQConfig.EMPLOYEE_CREATED_ROUTING_KEY,
                event);
    }
}