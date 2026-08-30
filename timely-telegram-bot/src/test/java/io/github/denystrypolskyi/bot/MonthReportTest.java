package io.github.denystrypolskyi.bot;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MonthReportTest {

    private static final ZoneId WARSAW = ZoneId.of("Europe/Warsaw");

    @Test
    void resolvesCurrentMonthInConfiguredTimeZone() {
        Clock clock = Clock.fixed(Instant.parse("2026-06-30T22:30:00Z"), ZoneOffset.UTC);

        YearMonth month = MonthReport.parseRequestedMonth("/month", clock, WARSAW);

        assertEquals(YearMonth.of(2026, 7), month);
    }

    @Test
    void parsesExplicitMonth() {
        YearMonth month = MonthReport.parseRequestedMonth(
                "/month 2026-06",
                Clock.systemUTC(),
                WARSAW
        );

        assertEquals(YearMonth.of(2026, 6), month);
    }

    @Test
    void rejectsInvalidMonth() {
        assertThrows(
                DateTimeParseException.class,
                () -> MonthReport.parseRequestedMonth(
                        "/month July 2026",
                        Clock.systemUTC(),
                        WARSAW
                )
        );
    }

    @Test
    void formatsSortedShiftsAndTotalInConfiguredTimeZone() {
        List<Shift> shifts = List.of(
                new Shift(
                        2L,
                        null,
                        Instant.parse("2026-07-03T06:00:00Z"),
                        Instant.parse("2026-07-03T14:00:00Z")
                ),
                new Shift(
                        1L,
                        510L,
                        Instant.parse("2026-07-02T06:00:00Z"),
                        Instant.parse("2026-07-02T14:30:00Z")
                )
        );

        String report = MonthReport.format(YearMonth.of(2026, 7), shifts, WARSAW);

        assertEquals("""
                📅 July 2026

                02.07, Thu │ 08:00–16:30 │ 8h 30m │ #1
                03.07, Fri │ 08:00–16:00 │ 8h │ #2

                ⏱ Total · 16h 30m""", report);
    }

    @Test
    void makesTheEndDateExplicitForAnOvernightShift() {
        Shift overnight = new Shift(
                7L,
                null,
                Instant.parse("2026-07-02T20:00:00Z"),
                Instant.parse("2026-07-03T04:00:00Z")
        );

        String report = MonthReport.format(YearMonth.of(2026, 7), List.of(overnight), WARSAW);

        assertEquals("""
                📅 July 2026

                02.07, Thu │ 22:00–03.07 06:00 │ 8h │ #7

                ⏱ Total · 8h""", report);
    }

    @Test
    void underlinesOnlyTheSundayWeekday() {
        Shift sunday = new Shift(
                9L,
                480L,
                Instant.parse("2026-07-05T06:00:00Z"),
                Instant.parse("2026-07-05T14:00:00Z")
        );

        String report = MonthReport.format(YearMonth.of(2026, 7), List.of(sunday), WARSAW);

        assertEquals("""
                📅 July 2026

                05.07, <u>Sun</u> │ 08:00–16:00 │ 8h │ #9

                ⏱ Total · 8h""", report);
    }

    @Test
    void formatsEmptyMonth() {
        String report = MonthReport.format(YearMonth.of(2026, 7), List.of(), WARSAW);

        assertEquals("📅 July 2026\n\nNo shifts yet.", report);
    }
}
