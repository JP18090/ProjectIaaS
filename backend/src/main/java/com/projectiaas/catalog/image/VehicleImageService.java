package com.projectiaas.catalog.image;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import com.projectiaas.catalog.dto.VehicleResponse;
import com.projectiaas.catalog.service.VehicleService;

@Service
public class VehicleImageService {

    private static final Duration CACHE_TTL = Duration.ofHours(6);

    private final VehicleService vehicleService;
    private final RestClient restClient;
    private final Map<String, CachedImages> cache = new ConcurrentHashMap<>();

    public VehicleImageService(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
        this.restClient = RestClient.builder()
                .defaultHeader(HttpHeaders.USER_AGENT,
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .build();
    }

    public List<VehicleImageResponse> findByVehicleId(Long id, int limit) {
        VehicleResponse vehicle = vehicleService.findById(id);
        return search(buildQueries(vehicle), limit);
    }

    public List<VehicleImageResponse> search(String query, int limit) {
        return search(List.of(query), limit);
    }

    public List<VehicleImageResponse> search(List<String> queries, int limit) {
        String query = queries.stream()
                .filter(StringUtils::hasText)
                .findFirst()
                .orElse("");

        if (!StringUtils.hasText(query)) {
            return List.of();
        }

        int safeLimit = Math.max(1, Math.min(limit, 8));
        String cacheKey = query + "::" + safeLimit;
        CachedImages cached = cache.get(cacheKey);
        if (cached != null && cached.expiresAt().isAfter(Instant.now())) {
            return cached.images();
        }

        try {
            List<VehicleImageResponse> images = List.of();
            for (String candidate : queries) {
                if (!StringUtils.hasText(candidate)) {
                    continue;
                }
                images = searchWikimediaCommons(candidate, safeLimit);
                if (!images.isEmpty()) {
                    break;
                }
            }
            cache.put(cacheKey, new CachedImages(images, Instant.now().plus(CACHE_TTL)));
            return images;
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private List<VehicleImageResponse> searchWikimediaCommons(String query, int limit) {
        String html = restClient.get()
                .uri("https://commons.wikimedia.org/w/index.php?search={query}&title=Special:MediaSearch&go=Go&type=image", query)
                .retrieve()
                .body(String.class);

        Document document = Jsoup.parse(html, "https://commons.wikimedia.org");
        List<VehicleImageResponse> images = new ArrayList<>();

        for (Element resultLink : document.select("a.sdms-image-result")) {
            Element image = resultLink.selectFirst("img[src], img[data-src]");
            if (image == null) {
                continue;
            }

            String imageUrl = firstNonBlank(
                    image.absUrl("src"),
                    image.absUrl("data-src"),
                    image.attr("src"),
                    image.attr("data-src"));

            if (!StringUtils.hasText(imageUrl)) {
                continue;
            }

            String title = normalizeTitle(firstNonBlank(
                    resultLink.attr("title"),
                    image.attr("alt"),
                    query));

            images.add(new VehicleImageResponse(
                    imageUrl,
                    imageUrl,
                    title,
                    resultLink.absUrl("href")));

            if (images.size() >= limit) {
                break;
            }
        }

        return Collections.unmodifiableList(images);
    }

    private String normalizeTitle(String value) {
        return value
                .replace("File:", "")
                .replace('_', ' ')
                .trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return "";
    }

    private List<String> buildQueries(VehicleResponse vehicle) {
        String brand = value(vehicle.brand());
        String model = value(vehicle.model());
        String year = vehicle.year() == null ? "" : String.valueOf(vehicle.year());
        String simplifiedModel = simplifyModel(model);
        String compactModel = firstTokens(simplifiedModel, 2);

        List<String> queries = new ArrayList<>();
        queries.add(joinQuery(brand, model, year));
        queries.add(joinQuery(brand, model));
        queries.add(joinQuery(brand, simplifiedModel, year));
        queries.add(joinQuery(brand, simplifiedModel));
        queries.add(joinQuery(brand, compactModel, year));
        queries.add(joinQuery(brand, compactModel));
        queries.add(joinQuery(model, year));
        queries.add(joinQuery(simplifiedModel, year));
        queries.add(joinQuery(simplifiedModel));
        queries.add(joinQuery(brand, year));
        queries.add(joinQuery(model));
        return queries.stream()
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
    }

    private String joinQuery(String... parts) {
        return String.join(" ", List.of(parts))
                .trim()
                .replaceAll("\\s+", " ");
    }

    private String simplifyModel(String model) {
        if (!StringUtils.hasText(model)) {
            return "";
        }

        String normalized = model
                .replaceAll("(?i)\\b\\d+(?:[.,]\\d+)?\\s*(v6|v8|v10|v12|cv|cvt|turbo|biturbo|mhev|hev|hybrid)\\b", " ")
                .replaceAll("(?i)\\b\\d+(?:[.,]\\d+)?\\b", " ")
                .replaceAll("(?i)\\b(automatico|aut\\.|manual|gasolina|etanol|diesel|flex|hibrido|eletrico)\\b", " ")
                .replaceAll("\\s+", " ")
                .trim();

        return StringUtils.hasText(normalized) ? normalized : model;
    }

    private String firstTokens(String value, int count) {
        if (!StringUtils.hasText(value)) {
            return "";
        }

        String[] tokens = value.trim().split("\\s+");
        return String.join(" ", List.of(tokens).subList(0, Math.min(count, tokens.length)));
    }

    private String value(Object input) {
        return input == null ? "" : String.valueOf(input).trim();
    }

    private record CachedImages(List<VehicleImageResponse> images, Instant expiresAt) {
    }
}