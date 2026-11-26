package com.fintrack.expensetracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fintrack.expensetracker.dto.LoginRequest;
import com.fintrack.expensetracker.dto.RegisterRequest;
import com.fintrack.expensetracker.dto.TransactionRequest;
import com.fintrack.expensetracker.entity.PaymentMethod;
import com.fintrack.expensetracker.entity.TransactionType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ExpenseTrackerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String obtainDemoToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/demo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("demo@fintrack.app"))
                .andReturn();
        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("token").asText();
    }

    @Test
    void demoAccountAndDashboardSummaryWorkEndToEnd() throws Exception {
        String token = obtainDemoToken();

        mockMvc.perform(get("/api/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kpis.monthlyIncome", greaterThan(0.0)))
                .andExpect(jsonPath("$.kpis.monthlyExpenses", greaterThan(0.0)))
                .andExpect(jsonPath("$.categoryBreakdown", not(empty())))
                .andExpect(jsonPath("$.budgetHealth", not(empty())))
                .andExpect(jsonPath("$.recentTransactions", hasSize(6)));

        mockMvc.perform(get("/api/transactions")
                        .param("size", "50")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(35));
    }

    @Test
    void registerLoginAndTransactionCrudFlow() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setFullName("Jordan Lee");
        reg.setEmail("jordan.lee@example.com");
        reg.setPassword("Secret@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reg)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty());

        LoginRequest login = new LoginRequest();
        login.setEmail("jordan.lee@example.com");
        login.setPassword("Secret@123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        MvcResult catResult = mockMvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(10)))
                .andReturn();

        Long expenseCategoryId = objectMapper.readTree(catResult.getResponse().getContentAsString()).get(0).get("id").asLong();

        TransactionRequest txReq = new TransactionRequest();
        txReq.setTitle("Test Artisan Bakery");
        txReq.setAmount(new BigDecimal("24.50"));
        txReq.setType(TransactionType.EXPENSE);
        txReq.setCategoryId(expenseCategoryId);
        txReq.setPaymentMethod(PaymentMethod.CARD);
        txReq.setDate(LocalDate.now());
        txReq.setNotes("Morning pastries");
        txReq.setRecurring(false);
        txReq.setSplitWith("Sam");

        MvcResult createTxResult = mockMvc.perform(post("/api/transactions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Artisan Bakery"))
                .andReturn();

        Long txId = objectMapper.readTree(createTxResult.getResponse().getContentAsString()).get("id").asLong();

        mockMvc.perform(get("/api/transactions/export")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Test Artisan Bakery")));

        mockMvc.perform(delete("/api/transactions/" + txId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void unauthenticatedRequestsReturn401Json() throws Exception {
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Authentication required"));
    }
}
