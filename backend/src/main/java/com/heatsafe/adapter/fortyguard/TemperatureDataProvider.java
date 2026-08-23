package com.heatsafe.adapter.fortyguard;

import com.heatsafe.domain.temperature.TemperatureSeries;

public interface TemperatureDataProvider {
    TemperatureSeries getSeries(Location location, TimeWindow window);
}
