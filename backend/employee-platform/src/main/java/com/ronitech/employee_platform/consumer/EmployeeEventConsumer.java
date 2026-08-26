package com.ronitech.employee_platform.consumer;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.ronitech.employee_platform.config.RabbitMQConfig;
import com.ronitech.employee_platform.event.EmployeeCreatedEvent;

@Component
public class EmployeeEventConsumer {

    @RabbitListener(queues = RabbitMQConfig.EMPLOYEE_QUEUE)
    public void handleEmployeeCreated(
            EmployeeCreatedEvent event) {

        System.out.println(
                "Employee created: "
                        + event.employeeId()
                        + " - "
                        + event.email());
    }
}