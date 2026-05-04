package com.projectiaas.catalog.fipe.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import com.projectiaas.catalog.fipe.dto.FipeOptionResponse;
import com.projectiaas.catalog.fipe.dto.FipeVehicleInfoResponse;

@Service
public class FipeService {

    private static final ParameterizedTypeReference<List<Map<String, Object>>> LIST_OF_MAPS =
            new ParameterizedTypeReference<>() {
            };

    private final RestClient restClient;
    private final String subscriptionToken;
    private final String defaultReference;

    public FipeService(
            @Value("${app.fipe.base-url}") String baseUrl,
            @Value("${app.fipe.subscription-token:}") String subscriptionToken,
            @Value("${app.fipe.reference:}") String defaultReference) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json")
                .build();
        this.subscriptionToken = subscriptionToken;
        this.defaultReference = defaultReference;
    }

    public List<FipeOptionResponse> getBrands() {
        return fetchList("/cars/brands").stream()
                .map(this::toOption)
                .toList();
    }

    public List<FipeOptionResponse> getModels(String brandId) {
        return fetchList("/cars/brands/{brandId}/models", brandId).stream()
                .map(this::toOption)
                .toList();
    }

    public List<FipeOptionResponse> getYears(String brandId, String modelId) {
        return fetchList("/cars/brands/{brandId}/models/{modelId}/years", brandId, modelId).stream()
                .map(this::toOption)
                .toList();
    }

    public FipeVehicleInfoResponse getVehicleInfo(String brandId, String modelId, String yearId) {
        Map<String, Object> body = fetchMap("/cars/brands/{brandId}/models/{modelId}/years/{yearId}", brandId, modelId, yearId);
        return new FipeVehicleInfoResponse(
                asString(body.get("price")),
                asString(body.get("brand")),
                asString(body.get("model")),
                asInteger(body.get("modelYear")),
                asString(body.get("fuel")),
                asString(body.get("fipeCode")),
                asString(body.get("referenceMonth")),
                asString(body.get("vehicleType")));
    }

    private List<Map<String, Object>> fetchList(String path, Object... uriVariables) {
        return request(path, uriVariables)
                .retrieve()
                .body(LIST_OF_MAPS);
    }

    private Map<String, Object> fetchMap(String path, Object... uriVariables) {
        return request(path, uriVariables)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });
    }

    private RestClient.RequestHeadersSpec<?> request(String path, Object... uriVariables) {
        return restClient.get()
                .uri(uriBuilder -> {
                    var builder = uriBuilder.path(path);
                    String reference = resolveReference();
                    if (StringUtils.hasText(reference)) {
                        builder.queryParam("reference", reference);
                    }
                    return builder.build(uriVariables);
                })
                .headers(headers -> {
                    if (StringUtils.hasText(subscriptionToken)) {
                        headers.set("X-Subscription-Token", subscriptionToken);
                    }
                });
    }

    private String resolveReference() {
        return StringUtils.hasText(defaultReference) ? defaultReference : null;
    }

    private FipeOptionResponse toOption(Map<String, Object> item) {
        return new FipeOptionResponse(asString(item.get("code")), asString(item.get("name")));
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Integer asInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }
}