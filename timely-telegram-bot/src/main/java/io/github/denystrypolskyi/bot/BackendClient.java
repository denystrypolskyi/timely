package io.github.denystrypolskyi.bot;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class BackendClient {

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final URI backendUrl;
    private final String username;
    private final String password;

    private String jwt;

    public BackendClient(URI backendUrl, String username, String password) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(REQUEST_TIMEOUT)
                .build();
        this.objectMapper = new ObjectMapper();
        this.backendUrl = backendUrl;
        this.username = username;
        this.password = password;
    }

    public UserProfile getProfile() throws BackendException {
        HttpResponse<String> response = sendAuthenticatedGet("/api/users/profile");

        if (response.statusCode() != 200) {
            throw new BackendException(
                    "Profile request failed",
                    response.statusCode()
            );
        }

        try {
            JsonNode profile = objectMapper.readTree(response.body());
            return new UserProfile(
                    longValue(profile, "id"),
                    textValue(profile, "username"),
                    textValue(profile, "email"),
                    textValue(profile, "fullName"),
                    textValue(profile, "role")
            );
        } catch (JsonProcessingException exception) {
            throw new BackendException("Backend returned an invalid profile", exception);
        }
    }

    public List<Shift> getShifts(YearMonth month) throws BackendException {
        String path = "/api/shifts/user/" + month.getYear() + "/" + month.getMonthValue();
        HttpResponse<String> response = sendAuthenticatedGet(path);

        if (response.statusCode() != 200) {
            throw new BackendException(
                    "Monthly shifts request failed",
                    response.statusCode()
            );
        }

        return parseShifts(response.body());
    }

    public List<Shift> getAllShifts() throws BackendException {
        HttpResponse<String> response = sendAuthenticatedGet("/api/shifts/user");

        if (response.statusCode() != 200) {
            throw new BackendException(
                    "Shifts request failed",
                    response.statusCode()
            );
        }

        return parseShifts(response.body());
    }

    public Shift createShift(Instant start, Instant end) throws BackendException {
        String requestBody;
        try {
            requestBody = objectMapper.writeValueAsString(Map.of(
                    "shiftStart", start.toString(),
                    "shiftEnd", end.toString()
            ));
        } catch (JsonProcessingException exception) {
            throw new BackendException("Could not create shift request", exception);
        }

        HttpResponse<String> response = sendCreateShiftRequest(requestBody, getOrCreateJwt());
        if (response.statusCode() == 401) {
            jwt = null;
            response = sendCreateShiftRequest(requestBody, getOrCreateJwt());
        }

        if (response.statusCode() != 201) {
            throw new BackendException("Create shift request failed", response.statusCode());
        }

        try {
            return parseShift(objectMapper.readTree(response.body()));
        } catch (JsonProcessingException | DateTimeParseException exception) {
            throw new BackendException("Backend returned an invalid created shift", exception);
        }
    }

    public void deleteShift(long shiftId) throws BackendException {
        HttpResponse<String> response = sendDeleteShiftRequest(shiftId, getOrCreateJwt());
        if (response.statusCode() == 401) {
            jwt = null;
            response = sendDeleteShiftRequest(shiftId, getOrCreateJwt());
        }

        if (response.statusCode() != 204) {
            throw new BackendException("Delete shift request failed", response.statusCode());
        }
    }

    private String getOrCreateJwt() throws BackendException {
        if (jwt == null) {
            jwt = login();
        }
        return jwt;
    }

    private String login() throws BackendException {
        String requestBody;
        try {
            requestBody = objectMapper.writeValueAsString(Map.of(
                    "username", username,
                    "password", password
            ));
        } catch (JsonProcessingException exception) {
            throw new BackendException("Could not create login request", exception);
        }

        HttpRequest request = HttpRequest.newBuilder(endpoint("/api/users/login"))
                .timeout(REQUEST_TIMEOUT)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = send(request);
        if (response.statusCode() != 200) {
            throw new BackendException("Backend login failed", response.statusCode());
        }

        try {
            String token = objectMapper.readTree(response.body()).path("token").asText();
            if (token.isBlank()) {
                throw new BackendException("Login response did not contain a token");
            }
            return token;
        } catch (JsonProcessingException exception) {
            throw new BackendException("Backend returned an invalid login response", exception);
        }
    }

    private HttpResponse<String> sendAuthenticatedGet(String path) throws BackendException {
        HttpResponse<String> response = sendGet(path, getOrCreateJwt());

        if (response.statusCode() == 401) {
            jwt = null;
            response = sendGet(path, getOrCreateJwt());
        }

        return response;
    }

    private HttpResponse<String> sendGet(String path, String token) throws BackendException {
        HttpRequest request = HttpRequest.newBuilder(endpoint(path))
                .timeout(REQUEST_TIMEOUT)
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();

        return send(request);
    }

    private HttpResponse<String> sendCreateShiftRequest(String requestBody, String token)
            throws BackendException {
        HttpRequest request = HttpRequest.newBuilder(endpoint("/api/shifts"))
                .timeout(REQUEST_TIMEOUT)
                .header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        return send(request);
    }

    private HttpResponse<String> sendDeleteShiftRequest(long shiftId, String token)
            throws BackendException {
        HttpRequest request = HttpRequest.newBuilder(endpoint("/api/shifts/" + shiftId))
                .timeout(REQUEST_TIMEOUT)
                .header("Authorization", "Bearer " + token)
                .DELETE()
                .build();

        return send(request);
    }

    private HttpResponse<String> send(HttpRequest request) throws BackendException {
        try {
            return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new BackendException("Backend request was interrupted", exception);
        } catch (IOException exception) {
            throw new BackendException("Could not reach the backend", exception);
        }
    }

    private URI endpoint(String path) {
        return URI.create(backendUrl + path);
    }

    private static Long longValue(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.longValue();
    }

    private static Shift parseShift(JsonNode shift) {
        return new Shift(
                longValue(shift, "id"),
                longValue(shift, "shiftDurationMinutes"),
                Instant.parse(requiredTextValue(shift, "shiftStart")),
                Instant.parse(requiredTextValue(shift, "shiftEnd"))
        );
    }

    private List<Shift> parseShifts(String responseBody) throws BackendException {
        try {
            JsonNode body = objectMapper.readTree(responseBody);
            if (!body.isArray()) {
                throw new BackendException("Backend returned an invalid shifts response");
            }

            List<Shift> shifts = new ArrayList<>();
            for (JsonNode shift : body) {
                shifts.add(parseShift(shift));
            }
            return List.copyOf(shifts);
        } catch (JsonProcessingException | DateTimeParseException exception) {
            throw new BackendException("Backend returned an invalid shifts response", exception);
        }
    }

    private static String textValue(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private static String requiredTextValue(JsonNode node, String field) {
        String value = textValue(node, field);
        if (value == null || value.isBlank()) {
            throw new DateTimeParseException("Missing " + field, "", 0);
        }
        return value;
    }
}
