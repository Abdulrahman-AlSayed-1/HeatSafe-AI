FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app

# Create a non-root user for Hugging Face Spaces security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER 1000

COPY --from=build --chown=1000:1000 /app/target/*.jar app.jar

ENV PORT=7860
EXPOSE 7860

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
