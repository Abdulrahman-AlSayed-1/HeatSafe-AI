package com.heatsafe.adapter.fortyguard;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {
    private Double latitude;
    private Double longitude;
    private String timezone;
}
