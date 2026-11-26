package com.fintrack.expensetracker.config;

import com.fintrack.expensetracker.service.DemoDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final DemoDataService demoDataService;

    @Override
    public void run(String... args) {
        demoDataService.ensureDemoUserSeeded();
    }
}
