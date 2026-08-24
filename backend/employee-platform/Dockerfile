FROM eclipse-temurin:22-jre

WORKDIR /app

COPY build/libs/employee-platform-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]