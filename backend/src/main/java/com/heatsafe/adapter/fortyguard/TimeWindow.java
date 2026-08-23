package com.heatsafe.adapter.fortyguard;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeWindow {
    private LocalDateTime start;
    private LocalDateTime end;
}
