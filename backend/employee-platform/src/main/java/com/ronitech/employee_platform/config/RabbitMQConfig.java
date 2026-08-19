package com.ronitech.employee_platform.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

@Configuration
public class RabbitMQConfig {

    public static final String EMPLOYEE_EXCHANGE = "employee.exchange";

    public static final String EMPLOYEE_QUEUE = "employee.queue";

    public static final String EMPLOYEE_CREATED_ROUTING_KEY = "employee.created";

    @Bean
    public TopicExchange employeeExchange() {
        return new TopicExchange(EMPLOYEE_EXCHANGE);
    }

    @Bean
    public Queue employeeQueue() {
        return new Queue(EMPLOYEE_QUEUE);
    }

    @Bean
    public Binding employeeCreatedBinding(
            Queue employeeQueue,
            TopicExchange employeeExchange) {

        return BindingBuilder
                .bind(employeeQueue)
                .to(employeeExchange)
                .with(EMPLOYEE_CREATED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jacksonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }
}